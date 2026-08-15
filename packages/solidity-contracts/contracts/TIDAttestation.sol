// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./interfaces/IERC5192.sol";
import "./interfaces/ITIDAnchor.sol";
import "./interfaces/ITIDAttestation.sol";

/**
 * @title TIDAttestation
 * @notice ERC-5192 Soulbound Token mirror of Midnight TIDs on Base
 * @dev SBTs representing TID credentials from Midnight Network
 */
contract TIDAttestation is ITIDAttestation, AccessControl, ReentrancyGuard, Pausable {
    using EnumerableSet for EnumerableSet.UintSet;

    /// @notice Role for guardians who can revoke attestations
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    /// @notice Role for pausing the contract
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Reference to TID Anchor on Ethereum
    ITIDAnchor public immutable anchor;

    /// @notice Attestation data structure
    struct Attestation {
        address owner;
        bytes32 tidHash;
        uint256 midnightBlockNumber;
        uint256 issuedAt;
        bool valid;
    }

    /// @notice Mapping of token ID to attestation
    mapping(uint256 => Attestation) public attestations;

    /// @notice Mapping of TID hash to token ID
    mapping(bytes32 => uint256) public tidToTokenId;

    /// @notice Mapping of owner to their token IDs
    mapping(address => EnumerableSet.UintSet) private _ownerTokens;

    /// @notice Next token ID to mint
    uint256 public nextTokenId = 1;

    /// @notice Total number of attestations issued
    uint256 public totalAttestations;

    /// @notice Base URI for token metadata
    string private _baseURI;

    /// @notice Name of the token
    string private _name;

    /// @notice Symbol of the token
    string private _symbol;

    // =========================================================================
    // Events
    // =========================================================================

    event BaseURIUpdated(string oldURI, string newURI);

    // =========================================================================
    // Errors
    // =========================================================================

    error InvalidAnchor();
    error InvalidTIDProof();
    error AlreadyAttested();
    error InvalidTokenId();
    error NotTokenOwner();
    error SoulboundTransfer();

    // =========================================================================
    // Constructor
    // =========================================================================

    /**
     * @notice Initialize the contract
     * @param anchorAddress Address of TID Anchor contract
     * @param name Token name
     * @param symbol Token symbol
     * @param baseURI Base URI for metadata
     */
    constructor(
        address anchorAddress,
        string memory name,
        string memory symbol,
        string memory baseURI
    ) {
        require(anchorAddress != address(0), "Invalid anchor");
        anchor = ITIDAnchor(anchorAddress);

        _name = name;
        _symbol = symbol;
        _baseURI = baseURI;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    // =========================================================================
    // ERC-5192 / ERC-721 View Functions
    // =========================================================================

    /**
     * @notice Returns whether the token is locked (always true for SBTs)
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        require(_tokenIdExists(tokenId), "Invalid token ID");
        return true; // Always locked (soulbound)
    }

    /**
     * @notice Get token name
     */
    function name() external view returns (string memory) {
        return _name;
    }

    /**
     * @notice Get token symbol
     */
    function symbol() external view returns (string memory) {
        return _symbol;
    }

    /**
     * @notice Get token URI
     */
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_tokenIdExists(tokenId), "Invalid token ID");
        return bytes(_baseURI).length > 0
            ? string(abi.encodePacked(_baseURI, _toString(tokenId)))
            : "";
    }

    /**
     * @notice Get base URI
     */
    function baseURI() external view returns (string memory) {
        return _baseURI;
    }

    /**
     * @notice Get owner of token
     */
    function ownerOf(uint256 tokenId) external view returns (address) {
        require(_tokenIdExists(tokenId), "Invalid token ID");
        return attestations[tokenId].owner;
    }

    /**
     * @notice Get balance of owner
     */
    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "Zero address");
        return _ownerTokens[owner].length();
    }

    /**
     * @notice Get all token IDs owned by address
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        require(owner != address(0), "Zero address");
        uint256 length = _ownerTokens[owner].length();
        uint256[] memory tokens = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            tokens[i] = _ownerTokens[owner].at(i);
        }
        return tokens;
    }

    // =========================================================================
    // Attestation Functions
    // =========================================================================

    /**
     * @notice Mirror TID from Midnight to Base
     * @param tidHash Hash of the TID credential
     * @param merkleProof Merkle proof for verification
     * @param midnightBlockNumber Block number on Midnight
     * @return tokenId The token ID of the attestation
     */
    function mirrorTID(
        bytes32 tidHash,
        bytes32[] calldata merkleProof,
        uint256 midnightBlockNumber
    ) external override whenNotPaused nonReentrant returns (uint256) {
        // Verify against anchor
        if (!anchor.verifyTID(tidHash, merkleProof)) {
            revert InvalidTIDProof();
        }

        // Check not already attested
        if (tidToTokenId[tidHash] != 0) {
            revert AlreadyAttested();
        }

        uint256 tokenId = nextTokenId++;

        // Create attestation
        attestations[tokenId] = Attestation({
            owner: msg.sender,
            tidHash: tidHash,
            midnightBlockNumber: midnightBlockNumber,
            issuedAt: block.timestamp,
            valid: true
        });

        tidToTokenId[tidHash] = tokenId;
        _ownerTokens[msg.sender].add(tokenId);
        totalAttestations++;

        emit AttestationIssued(tokenId, msg.sender, tidHash);
        return tokenId;
    }

    /**
     * @notice Batch mirror multiple TIDs
     */
    function mirrorTIDBatch(
        bytes32[] calldata tidHashes,
        bytes32[][] calldata merkleProofs,
        uint256[] calldata midnightBlockNumbers
    ) external whenNotPaused nonReentrant returns (uint256[] memory) {
        require(
            tidHashes.length == merkleProofs.length &&
            tidHashes.length == midnightBlockNumbers.length,
            "Length mismatch"
        );

        uint256[] memory tokenIds = new uint256[](tidHashes.length);
        for (uint256 i = 0; i < tidHashes.length; i++) {
            tokenIds[i] = this.mirrorTID(tidHashes[i], merkleProofs[i], midnightBlockNumbers[i]);
        }
        return tokenIds;
    }

    /**
     * @notice Revoke attestation
     * @param tokenId Token ID to revoke
     */
    function revokeAttestation(uint256 tokenId) external override onlyRole(GUARDIAN_ROLE) {
        require(_tokenIdExists(tokenId), "Invalid token ID");
        require(attestations[tokenId].valid, "Already revoked");

        attestations[tokenId].valid = false;
        emit AttestationRevoked(tokenId);
    }

    /**
     * @notice Get attestation by token ID
     */
    function getAttestation(uint256 tokenId) external view override returns (
        address owner,
        bytes32 tidHash,
        uint256 midnightBlockNumber,
        uint256 issuedAt,
        bool valid
    ) {
        require(_tokenIdExists(tokenId), "Invalid token ID");
        Attestation storage att = attestations[tokenId];
        return (att.owner, att.tidHash, att.midnightBlockNumber, att.issuedAt, att.valid);
    }

    /**
     * @notice Get token ID by TID hash
     */
    function getTokenId(bytes32 tidHash) external view override returns (uint256) {
        return tidToTokenId[tidHash];
    }

    /**
     * @notice Check if TID is attested and valid
     */
    function isValidAttestation(uint256 tokenId) external view returns (bool) {
        return _tokenIdExists(tokenId) && attestations[tokenId].valid;
    }

    /**
     * @notice Check if owner has valid attestation for TID
     */
    function hasValidAttestation(address owner, bytes32 tidHash) external view returns (bool) {
        uint256 tokenId = tidToTokenId[tidHash];
        return tokenId != 0 &&
               attestations[tokenId].owner == owner &&
               attestations[tokenId].valid;
    }

    // =========================================================================
    // Admin Functions
    // =========================================================================

    /**
     * @notice Set base URI
     */
    function setBaseURI(string memory _newBaseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        string memory oldURI = _baseURI;
        _baseURI = _newBaseURI;
        emit BaseURIUpdated(oldURI, _newBaseURI);
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
     * @notice Check if token ID exists
     */
    function _tokenIdExists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId < nextTokenId;
    }

    /**
     * @notice Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @notice Prevent transfers (soulbound)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal pure {
        require(from == address(0) || to == address(0), "Soulbound: non-transferable");
    }

    /**
     * @notice fallback function to receive ETH
     */
    receive() external payable {}
}
