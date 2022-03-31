// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract NFT is ERC721, AccessControl {
    uint256 public nextTokenId;

    // Create a new role identifier for the minter role
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Optional mapping for token URIs
    mapping(uint256 => string) internal tokenURIs;

    /**
    * @dev Returns an URI for a given token ID
  * Throws if the token ID does not exist. May return an empty string.
  * @param _tokenId uint256 ID of the token to query
  */
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        return tokenURIs[_tokenId];
    }

    /**
    * @dev Public function to set the token URI for a given token (only minter)
  * Reverts if the token ID does not exist
  * @param _tokenId uint256 ID of the token to set its URI
  * @param _uri string URI to assign
  */
    function setTokenURI(uint256 _tokenId, string memory _uri) public onlyRole(MINTER_ROLE) {
        tokenURIs[_tokenId] = _uri;
    }

    /**
    * @notice Create custom ERC721
  * @param name of the ERC721 token
  * @param symbol of the ERC721 token
    */
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // Grant the minter role to a specified account
        _setupRole(MINTER_ROLE, msg.sender);
    }
    /**
    * @notice Mint some ERC721 tokens
  * @param client address of the potentional owner of the new token
    */
    function mint(address client, string memory _uri) public onlyRole(MINTER_ROLE) {
        _safeMint(client, nextTokenId);
        tokenURIs[nextTokenId] = _uri;
        nextTokenId ++;
    }

    /**
    * @notice The following functions are overrides required by Solidity.
  * @dev See {IERC165-supportsInterface}.
  * @param interfaceId interface id
  */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}