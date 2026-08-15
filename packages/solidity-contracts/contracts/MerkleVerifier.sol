// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MerkleVerifier
 * @notice Library for efficient Merkle proof verification
 */
library MerkleVerifier {
    /**
     * @notice Verify a Merkle proof
     * @param proof Merkle proof containing sibling hashes
     * @param root Merkle root
     * @param leaf Leaf node to verify
     * @return True if proof is valid
     */
    function verify(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool) {
        return _verify(proof, root, leaf);
    }

    /**
     * @notice Verify multiple leaves against the same root
     * @param proofs Array of Merkle proofs
     * @param root Merkle root
     * @param leaves Array of leaves
     * @return Array of verification results
     */
    function verifyBatch(
        bytes32[][] memory proofs,
        bytes32 root,
        bytes32[] memory leaves
    ) internal pure returns (bool[] memory) {
        require(proofs.length == leaves.length, "Length mismatch");

        bool[] memory results = new bool[](leaves.length);
        for (uint256 i = 0; i < leaves.length; i++) {
            results[i] = _verify(proofs[i], root, leaves[i]);
        }
        return results;
    }

    /**
     * @notice Internal verification function
     */
    function _verify(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) private pure returns (bool) {
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
     * @notice Compute Merkle root from leaves
     * @param leaves Array of leaf hashes
     * @return Computed Merkle root
     */
    function computeRoot(bytes32[] memory leaves) internal pure returns (bytes32) {
        require(leaves.length > 0, "Empty leaves");

        uint256 layerSize = leaves.length;
        bytes32[] memory layer = leaves;

        while (layerSize > 1) {
            bytes32[] memory newLayer = new bytes32[]((layerSize + 1) / 2);

            for (uint256 i = 0; i < layerSize; i += 2) {
                bytes32 left = layer[i];
                bytes32 right = (i + 1 < layerSize) ? layer[i + 1] : left;

                if (left <= right) {
                    newLayer[i / 2] = keccak256(abi.encodePacked(left, right));
                } else {
                    newLayer[i / 2] = keccak256(abi.encodePacked(right, left));
                }
            }

            layer = newLayer;
            layerSize = newLayer.length;
        }

        return layer[0];
    }

    /**
     * @notice Generate a compact proof for a leaf index
     * @param leaves All leaves in the tree
     * @param index Index of the leaf to prove
     * @return proof The Merkle proof
     * @return root The computed root
     */
    function generateProof(
        bytes32[] memory leaves,
        uint256 index
    ) internal pure returns (bytes32[] memory proof, bytes32 root) {
        require(index < leaves.length, "Index out of bounds");

        uint256 size = leaves.length;
        bytes32[] memory proofTemp = new bytes32[](32); // Max depth
        uint256 proofLength = 0;

        while (size > 1) {
            uint256 siblingIndex = (index % 2 == 0) ? index + 1 : index - 1;

            if (siblingIndex < leaves.length) {
                proofTemp[proofLength++] = leaves[siblingIndex];
            }

            index = index / 2;
            size = (size + 1) / 2;
        }

        // Trim proof to actual size
        proof = new bytes32[](proofLength);
        for (uint256 i = 0; i < proofLength; i++) {
            proof[i] = proofTemp[i];
        }

        root = computeRoot(leaves);
    }
}
