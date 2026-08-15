// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ITIDAnchor
 * @dev Interface for TID Anchor contract on Ethereum
 */
interface ITIDAnchor {
    /// @notice Merkle root of Midnight TID state
    function merkleRoot() external view returns (bytes32);

    /// @notice Verify TID using Merkle proof
    /// @param tidHash Hash of the TID credential
    /// @param merkleProof Merkle proof for verification
    /// @return True if proof is valid
    function verifyTID(
        bytes32 tidHash,
        bytes32[] calldata merkleProof
    ) external view returns (bool);

    /// @notice Update merkle root with multi-sig from guardians
    /// @param newRoot New merkle root from Midnight
    /// @param midnightBlockNumber Block number on Midnight
    /// @param signatures Concatenated guardian signatures
    /// @param signers Array of signing guardian addresses
    function updateRoot(
        bytes32 newRoot,
        uint256 midnightBlockNumber,
        bytes calldata signatures,
        address[] calldata signers
    ) external;

    /// @notice Emitted when merkle root is updated
    event RootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot, uint256 midnightBlock);
}
