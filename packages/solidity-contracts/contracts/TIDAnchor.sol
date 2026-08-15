// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/ITIDAnchor.sol";

/**
 * @title TIDAnchor
 * @notice Stores merkle root of Midnight TID state on Ethereum
 * @dev Serves as trust anchor for cross-chain verification
 */
contract TIDAnchor is ITIDAnchor, AccessControl, ReentrancyGuard, Pausable {
    /// @notice Role for guardians who can update merkle root
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    /// @notice Role for pausing the contract
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Merkle root of Midnight TID state
    bytes32 public override merkleRoot;

    /// @notice Number of signatures required for root update
    uint256 public signatureThreshold;

    /// @notice Current nonce for signature replay protection
    uint256 public nonce;

    /// @notice Root update history for fraud proofs
    struct RootUpdate {
        bytes32 oldRoot;
        bytes32 newRoot;
        uint256 midnightBlockNumber;
        uint256 timestamp;
    }

    /// @notice Mapping of update index to update data
    mapping(uint256 => RootUpdate) public updateHistory;
    uint256 public updateCount;

    /// @notice Mapping to track processed signatures
    mapping(bytes32 => bool) public processedSignatures;

    // =========================================================================
    // Events
    // =========================================================================

    event SignatureThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event GuardianGranted(address indexed guardian);
    event GuardianRevoked(address indexed guardian);

    // =========================================================================
    // Errors
    // =========================================================================

    error InvalidSignatureCount();
    error InvalidSignature();
    error SignatureAlreadyProcessed();
    error InvalidMerkleProof();
    error InvalidProofLength();

    // =========================================================================
    // Constructor
    // =========================================================================

    /**
     * @notice Initialize the contract
     * @param _guardians Array of guardian addresses
     * @param _signatureThreshold Number of signatures required
     * @param _initialRoot Initial merkle root (optional)
     */
    constructor(
        address[] memory _guardians,
        uint256 _signatureThreshold,
        bytes32 _initialRoot
    ) {
        require(_guardians.length > 0, "No guardians provided");
        require(_signatureThreshold > 0 && _signatureThreshold <= _guardians.length, "Invalid threshold");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);

        for (uint256 i = 0; i < _guardians.length; i++) {
            _grantRole(GUARDIAN_ROLE, _guardians[i]);
            emit GuardianGranted(_guardians[i]);
        }

        signatureThreshold = _signatureThreshold;
        merkleRoot = _initialRoot;
    }

    // =========================================================================
    // View Functions
    // =========================================================================

    /**
     * @notice Verify TID using Merkle proof
     * @param tidHash Hash of the TID credential
     * @param merkleProof Merkle proof for verification
     * @return True if proof is valid against current root
     */
    function verifyTID(
        bytes32 tidHash,
        bytes32[] calldata merkleProof
    ) external view override whenNotPaused returns (bool) {
        return _verifyMerkleProof(tidHash, merkleProof, merkleRoot);
    }

    /**
     * @notice Batch verify multiple TIDs
     * @param tidHashes Array of TID hashes
     * @param merkleProofs Array of Merkle proofs
     * @return Array of verification results
     */
    function verifyTIDBatch(
        bytes32[] calldata tidHashes,
        bytes32[] calldata merkleProofs
    ) external view whenNotPaused returns (bool[] memory) {
        require(tidHashes.length == merkleProofs.length, "Length mismatch");

        bool[] memory results = new bool[](tidHashes.length);
        for (uint256 i = 0; i < tidHashes.length; i++) {
            results[i] = _verifyMerkleProof(tidHashes[i], _getProof(merkleProofs, i), merkleRoot);
        }
        return results;
    }

    /**
     * @notice Get root update by index
     * @param index Update index
     * @return oldRoot Old merkle root
     * @return newRoot New merkle root
     * @return midnightBlockNumber Midnight block number
     * @return timestamp Update timestamp
     */
    function getRootUpdate(uint256 index) external view returns (
        bytes32 oldRoot,
        bytes32 newRoot,
        uint256 midnightBlockNumber,
        uint256 timestamp
    ) {
        require(index < updateCount, "Index out of bounds");
        RootUpdate storage update = updateHistory[index];
        return (update.oldRoot, update.newRoot, update.midnightBlockNumber, update.timestamp);
    }

    // =========================================================================
    // Admin Functions
    // =========================================================================

    /**
     * @notice Update merkle root with multi-sig from guardians
     * @param newRoot New merkle root from Midnight
     * @param midnightBlockNumber Block number on Midnight
     * @param signatures Concatenated guardian signatures
     * @param signers Array of signing guardian addresses
     */
    function updateRoot(
        bytes32 newRoot,
        uint256 midnightBlockNumber,
        bytes calldata signatures,
        address[] calldata signers
    ) external override onlyRole(GUARDIAN_ROLE) nonReentrant whenNotPaused {
        require(signatures.length > 0, "No signatures");
        require(signatures.length <= signatureThreshold, "Too many signatures");
        require(signatures.length == signers.length, "Signature/signer mismatch");

        // Verify all signers are guardians
        for (uint256 i = 0; i < signers.length; i++) {
            require(hasRole(GUARDIAN_ROLE, signers[i]), "Not a guardian");
        }

        // Verify signatures
        bytes32 messageHash = keccak256(abi.encodePacked(newRoot, midnightBlockNumber, nonce));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));

        for (uint256 i = 0; i < signatures.length; i++) {
            bytes memory sig = _getSignature(signatures, i);
            require(signers[i] == _recoverSigner(ethSignedHash, sig), "Invalid signature");
        }

        bytes32 oldRoot = merkleRoot;
        merkleRoot = newRoot;

        // Record in history
        updateHistory[updateCount++] = RootUpdate({
            oldRoot: oldRoot,
            newRoot: newRoot,
            midnightBlockNumber: midnightBlockNumber,
            timestamp: block.timestamp
        });

        nonce++;

        emit RootUpdated(oldRoot, newRoot, midnightBlockNumber);
    }

    /**
     * @notice Update signature threshold
     * @dev Only admin can call this
     */
    function setSignatureThreshold(uint256 _threshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_threshold > 0, "Threshold must be positive");
        uint256 oldThreshold = signatureThreshold;
        signatureThreshold = _threshold;
        emit SignatureThresholdUpdated(oldThreshold, _threshold);
    }

    /**
     * @notice Pause contract (emergency use)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // =========================================================================
    // Internal Functions
    // =========================================================================

    /**
     * @notice Internal Merkle proof verification
     * @param leaf Leaf node hash
     * @param proof Merkle proof
     * @param root Expected merkle root
     * @return True if proof is valid
     */
    function _verifyMerkleProof(
        bytes32 leaf,
        bytes32[] memory proof,
        bytes32 root
    ) internal pure returns (bool) {
        if (proof.length == 0) {
            return leaf == root;
        }

        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == root;
    }

    /**
     * @notice Recover signer from signature
     * @param hash Message hash
     * @param signature Signature bytes
     * @return Signer address
     */
    function _recoverSigner(bytes32 hash, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) v += 27;

        address signer = ecrecover(hash, v, r, s);
        require(signer != address(0), "Invalid ECDSA");

        return signer;
    }

    /**
     * @notice Extract single signature from concatenated signatures
     */
    function _getSignature(bytes memory signatures, uint256 index) internal pure returns (bytes memory) {
        require(signatures.length >= (index + 1) * 65, "Signature index out of bounds");
        bytes memory sig = new bytes(65);
        for (uint256 i = 0; i < 65; i++) {
            sig[i] = signatures[index * 65 + i];
        }
        return sig;
    }

    /**
     * @notice Extract proof from concatenated proofs
     */
    function _getProof(bytes32[] calldata merkleProofs, uint256 index) internal pure returns (bytes32[] memory) {
        // For simplicity, assuming single proof per call
        // In production, would need more sophisticated encoding
        bytes32[] memory proof = new bytes32[](merkleProofs.length);
        for (uint256 i = 0; i < merkleProofs.length; i++) {
            proof[i] = merkleProofs[i];
        }
        return proof;
    }
}
