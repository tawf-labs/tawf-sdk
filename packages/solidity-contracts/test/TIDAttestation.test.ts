import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { TIDAttestation, TIDAnchor } from '../typechain-types';

describe('TIDAttestation', function () {
  let attestation: TIDAttestation;
  let anchor: TIDAnchor;
  let guardian: SignerWithAddress;
  let user: SignerWithAddress;
  let deployer: SignerWithAddress;

  beforeEach(async function () {
    [deployer, guardian, user] = await ethers.getSigners();

    // Deploy anchor first
    const TIDAnchor = await ethers.getContractFactory('TIDAnchor');
    anchor = await TIDAnchor.deploy(
      [guardian.address],
      1,
      ethers.ZeroHash
    );
    await anchor.waitForDeployment();

    // Deploy attestation
    const TIDAttestation = await ethers.getContractFactory('TIDAttestation');
    attestation = await TIDAttestation.deploy(
      await anchor.getAddress(),
      'Tawf ID Attestation',
      'TID-SBT',
      'https://api.tawf.foundation/metadata/tid/'
    );
    await attestation.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set correct token metadata', async function () {
      expect(await attestation.name()).to.equal('Tawf ID Attestation');
      expect(await attestation.symbol()).to.equal('TID-SBT');
      expect(await attestation.baseURI()).to.equal('https://api.tawf.foundation/metadata/tid/');
    });

    it('Should reference anchor correctly', async function () {
      expect(await attestation.anchor()).to.equal(await anchor.getAddress());
    });
  });

  describe('Mirroring TID', function () {
    it('Should mirror TID with valid proof', async function () {
      // Set up merkle root
      const leaf1 = ethers.keccak256(ethers.toUtf8Bytes('tid1'));
      const leaf2 = ethers.keccak256(ethers.toUtf8Bytes('tid2'));
      const root = ethers.keccak256(
        ethers.concat([leaf1, leaf2].sort())
      );

      // Update anchor root
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'uint256', 'uint256'],
          [root, 0, 0]
        )
      );

      const ethSignedHash = ethers.keccak256(
        ethers.concat(['\x19Ethereum Signed Message:\n32', messageHash])
      );

      const sig = await guardian.signMessage(ethSignedHash);

      await anchor.connect(guardian).updateRoot(
        root,
        0,
        sig,
        [guardian.address]
      );

      // Mirror TID
      const tx = await attestation.connect(user).mirrorTID(leaf1, [leaf2], 12345);
      const receipt = await tx.wait();

      const tokenId = 1;
      expect(await attestation.ownerOf(tokenId)).to.equal(user.address);
    });

    it('Should reject invalid proof', async function () {
      const fakeLeaf = ethers.keccak256(ethers.toUtf8Bytes('fake'));
      const fakeProof = [ethers.keccak256(ethers.toUtf8Bytes('fakeProof'))];

      await expect(
        attestation.connect(user).mirrorTID(fakeLeaf, fakeProof, 12345)
      ).to.be.revertedWithCustomError(attestation, 'InvalidTIDProof');
    });

    it('Should reject duplicate attestation', async function () {
      // Set up merkle root
      const leaf = ethers.keccak256(ethers.toUtf8Bytes('tid1'));
      const otherLeaf = ethers.keccak256(ethers.toUtf8Bytes('tid2'));
      const root = ethers.keccak256(
        ethers.concat([leaf, otherLeaf].sort())
      );

      // Update anchor root
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'uint256', 'uint256'],
          [root, 0, 0]
        )
      );

      const ethSignedHash = ethers.keccak256(
        ethers.concat(['\x19Ethereum Signed Message:\n32', messageHash])
      );

      const sig = await guardian.signMessage(ethSignedHash);

      await anchor.connect(guardian).updateRoot(
        root,
        0,
        sig,
        [guardian.address]
      );

      // Mirror first time
      await attestation.connect(user).mirrorTID(leaf, [otherLeaf], 12345);

      // Try to mirror again
      await expect(
        attestation.connect(user).mirrorTID(leaf, [otherLeaf], 12345)
      ).to.be.revertedWithCustomError(attestation, 'AlreadyAttested');
    });
  });

  describe('ERC-5192 Soulbound', function () {
    it('Should always return true for locked', async function () {
      // Set up and mirror a TID
      const leaf = ethers.keccak256(ethers.toUtf8Bytes('tid1'));
      const otherLeaf = ethers.keccak256(ethers.toUtf8Bytes('tid2'));
      const root = ethers.keccak256(
        ethers.concat([leaf, otherLeaf].sort())
      );

      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'uint256', 'uint256'],
          [root, 0, 0]
        )
      );

      const ethSignedHash = ethers.keccak256(
        ethers.concat(['\x19Ethereum Signed Message:\n32', messageHash])
      );

      const sig = await guardian.signMessage(ethSignedHash);

      await anchor.connect(guardian).updateRoot(
        root,
        0,
        sig,
        [guardian.address]
      );

      await attestation.connect(user).mirrorTID(leaf, [otherLeaf], 12345);

      expect(await attestation.locked(1)).to.be.true;
    });
  });

  describe('Revocation', function () {
    it('Should allow guardian to revoke', async function () {
      // Set up and mirror a TID
      const leaf = ethers.keccak256(ethers.toUtf8Bytes('tid1'));
      const otherLeaf = ethers.keccak256(ethers.toUtf8Bytes('tid2'));
      const root = ethers.keccak256(
        ethers.concat([leaf, otherLeaf].sort())
      );

      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'uint256', 'uint256'],
          [root, 0, 0]
        )
      );

      const ethSignedHash = ethers.keccak256(
        ethers.concat(['\x19Ethereum Signed Message:\n32', messageHash])
      );

      const sig = await guardian.signMessage(ethSignedHash);

      await anchor.connect(guardian).updateRoot(
        root,
        0,
        sig,
        [guardian.address]
      );

      await attestation.connect(user).mirrorTID(leaf, [otherLeaf], 12345);

      // Grant guardian role
      const GUARDIAN_ROLE = await attestation.GUARDIAN_ROLE();
      await attestation.connect(deployer).grantRole(GUARDIAN_ROLE, guardian.address);

      // Revoke
      await expect(attestation.connect(guardian).revokeAttestation(1))
        .to.emit(attestation, 'AttestationRevoked')
        .withArgs(1);

      // Check validity
      const attData = await attestation.getAttestation(1);
      expect(attData.valid).to.be.false;
    });

    it('Should not allow non-guardian to revoke', async function () {
      // Grant guardian role
      const GUARDIAN_ROLE = await attestation.GUARDIAN_ROLE();
      await attestation.connect(deployer).grantRole(GUARDIAN_ROLE, guardian.address);

      await expect(
        attestation.connect(user).revokeAttestation(1)
      ).to.be.revertedWithCustomError(attestation, 'AccessControlUnauthorizedAccount');
    });
  });

  describe('Query Functions', function () {
    it('Should return correct attestation data', async function () {
      const tidHash = ethers.keccak256(ethers.toUtf8Bytes('tid1'));
      const otherLeaf = ethers.keccak256(ethers.toUtf8Bytes('tid2'));
      const root = ethers.keccak256(
        ethers.concat([tidHash, otherLeaf].sort())
      );

      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'uint256', 'uint256'],
          [root, 0, 0]
        )
      );

      const ethSignedHash = ethers.keccak256(
        ethers.concat(['\x19Ethereum Signed Message:\n32', messageHash])
      );

      const sig = await guardian.signMessage(ethSignedHash);

      await anchor.connect(guardian).updateRoot(
        root,
        0,
        sig,
        [guardian.address]
      );

      await attestation.connect(user).mirrorTID(tidHash, [otherLeaf], 12345);

      const att = await attestation.getAttestation(1);
      expect(att.owner).to.equal(user.address);
      expect(att.tidHash).to.equal(tidHash);
      expect(att.midnightBlockNumber).to.equal(12345);
      expect(att.valid).to.be.true;
    });

    it('Should return correct token ID by TID hash', async function () {
      const tidHash = ethers.keccak256(ethers.toUtf8Bytes('tid1'));
      const otherLeaf = ethers.keccak256(ethers.toUtf8Bytes('tid2'));
      const root = ethers.keccak256(
        ethers.concat([tidHash, otherLeaf].sort())
      );

      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'uint256', 'uint256'],
          [root, 0, 0]
        )
      );

      const ethSignedHash = ethers.keccak256(
        ethers.concat(['\x19Ethereum Signed Message:\n32', messageHash])
      );

      const sig = await guardian.signMessage(ethSignedHash);

      await anchor.connect(guardian).updateRoot(
        root,
        0,
        sig,
        [guardian.address]
      );

      await attestation.connect(user).mirrorTID(tidHash, [otherLeaf], 12345);

      expect(await attestation.getTokenId(tidHash)).to.equal(1);
    });
  });
});
