
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DocumentRegistry {
    struct Document {
        address owner;
        uint256 registeredAt;
        bool exists;
    }

    mapping(bytes32 => Document) private documents;

    event DocumentRegistered(
        bytes32 indexed documentHash,
        address indexed owner,
        uint256 registeredAt
    );

    function registerDocument(bytes32 documentHash) external {
        require(documentHash != bytes32(0), "Invalid document hash");
        require(!documents[documentHash].exists, "Document already registered");

        documents[documentHash] = Document({
            owner: msg.sender,
            registeredAt: block.timestamp,
            exists: true
        });

        emit DocumentRegistered(
            documentHash,
            msg.sender,
            block.timestamp
        );
    }

    function verifyDocument(
        bytes32 documentHash
    )
        external
        view
        returns (
            bool isRegistered,
            address owner,
            uint256 registeredAt
        )
    {
        Document memory document = documents[documentHash];

        return (
            document.exists,
            document.owner,
            document.registeredAt
        );
    }
}
