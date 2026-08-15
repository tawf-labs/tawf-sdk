// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ERC-5192 Minimal Soulbound NFTs
 * @dev Interface for minimal soulbound non-fungible tokens
 * @notice See https://eips.ethereum.org/EIPS/eip-5192
 */
interface IERC5192 {
    /**
     * @notice Returns whether the token is locked or not
     * @param tokenId The token identifier
     * @return locked True if the token is locked, false otherwise
     */
    function locked(uint256 tokenId) external view returns (bool);

    /**
     * @notice Emitted when the lock status of a token changes
     * @param tokenId The token identifier
     * @param locked The new lock status
     */
    event Locked(uint256 indexed tokenId, bool locked);
}
