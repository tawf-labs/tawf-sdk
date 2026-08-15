// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IERC5192.sol";

/**
 * @title ITIDAttestation
 * @dev Interface for TID Attestation contract on Base
 */
interface ITIDAttestation is IERC5192 {
    /// @notice Mirror TID from Midnight to Base
    /// @param tidHash Hash of the TID credential
    /// @param merkleProof Merkle proof for verification
    /// @param midnightBlockNumber Block number on Midnight
    /// @return tokenId The token ID of the attestation
    function mirrorTID(
        bytes32 tidHash,
        bytes32[] calldata merkleProof,
        uint256 midnightBlockNumber
    ) external returns (uint256);

    /// @notice Revoke attestation
    /// @param tokenId Token ID to revoke
    function revokeAttestation(uint256 tokenId) external;

    /// @notice Get attestation by token ID
    /// @param tokenId Token ID
    /// @return owner Owner address
    /// @return tidHash Hash of the TID
    /// @return midnightBlockNumber Midnight block number
    /// @return issuedAt Issuance timestamp
    /// @return valid Whether attestation is valid
    function getAttestation(uint256 tokenId) external view returns (
        address owner,
        bytes32 tidHash,
        uint256 midnightBlockNumber,
        uint256 issuedAt,
        bool valid
    );

    /// @notice Get token ID by TID hash
    /// @param tidHash Hash of the TID
    /// @return tokenId Token ID or 0 if not found
    function getTokenId(bytes32 tidHash) external view returns (uint256);

    /// @notice Emitted when attestation is issued
    event AttestationIssued(uint256 indexed tokenId, address indexed owner, bytes32 tidHash);

    /// @notice Emitted when attestation is revoked
    event AttestationRevoked(uint256 indexed tokenId);
}
