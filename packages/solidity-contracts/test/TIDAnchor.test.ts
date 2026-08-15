import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { TIDAnchor, MerkleVerifier } from '../typechain-types';

describe('TIDAnchor', function () {
  let anchor: TIDAnchor;
  let guardians: SignerWithAddress[];
  let user: SignerWithAddress;
  let deployer: SignerWithAddress;

  const GUARDIAN_COUNT = 3;
  const SIGNATURE_THRESHOLD = 2;

  beforeEach(async function () {
    [deployer, ...guardians] = await ethers.getSigners();
    user = guardians[guardians.length - 1];
    guardians = guardians.slice(0, GUARDIAN_COUNT);

    const TIDAnchor = await ethers.getContractFactory('TIDAnchor');
    anchor = await TIDAnchor.deploy(
      guardians.map(g => g.address),
      SIGNATURE_THRESHOLD,
      ethers.ZeroHash
    );
    await anchor.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the correct deployer as admin', async function () {
      const DEFAULT_ADMIN_ROLE = await anchor.DEFAULT_ADMIN_ROLE();
      expect(await anchor.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.be.true;
    });

    it('Should set all guardians', async function () {
      const GUARDIAN_ROLE = await anchor.GUARDIAN_ROLE();

      for (const guardian of guardians) {
        expect(await anchor.hasRole(GUARDIAN_ROLE, guardian.address)).to.be.true;
      }
    });

    it('Should set initial merkle root', async function () {
      expect(await anchor.merkleRoot()).to.equal(ethers.ZeroHash);
    });

    it('Should set signature threshold', async function () {
      expect(await anchor.signatureThreshold()).to.equal(SIGNATURE_THRESHOLD);
    });
  });

  describe('Root Update', function () {
    it('Should allow guardian to update root', async function () {
      const newRoot = ethers.keccak256(ethers.toUtf8Bytes('newRoot'));
      const midnightBlock = 12345;

      // Sign message
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'uint256', 'uint256'],
          [newRoot, midnightBlock, 0]
        )
      );

      const ethSignedHash = ethers.keccak256(
        ethers.concat(['\x19Ethereum Signed Message:\n32', messageHash])
      );

      const signatures = await Promise.all(
        guardians.slice(0, SIGNATURE_THRESHOLD).map(g => g.signMessage(ethers.ethers.Bytes32(ethSignedHash)))
      );

      const flatSig = ethers.concat(signatures);

      await expect(
        anchor.connect(guardians[0]).updateRoot(
          newRoot,
          midnightBlock,
          flatSig,
          guardians.slice(0, SIGNATURE_THRESHOLD).map(g => g.address)
        )
      ).to.emit(anchor, 'RootUpdated')
        .withArgs(ethers.ZeroHash, newRoot, midnightBlock);

      expect(await anchor.merkleRoot()).to.equal(newRoot);
    });

    it('Should reject update from non-guardian', async function () {
      const newRoot = ethers.keccak256(ethers.toUtf8Bytes('newRoot'));

      await expect(
        anchor.connect(user).updateRoot(
          newRoot,
          12345,
          '0x',
          []
        )
      ).to.be.revertedWithCustomError(anchor, 'AccessControlUnauthorizedAccount');
    });

    it('Should increment nonce after update', async function () {
      const newRoot = ethers.keccak256(ethers.toUtf8Bytes('newRoot'));

      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'uint256', 'uint256'],
          [newRoot, 0, await anchor.nonce()]
        )
      );

      const ethSignedHash = ethers.keccak256(
        ethers.concat(['\x19Ethereum Signed Message:\n32', messageHash])
      );

      const sigs = await Promise.all(
        guardians.slice(0, SIGNATURE_THRESHOLD).map(g => g.signMessage(ethSignedHash))
      );

      await anchor.connect(guardians[0]).updateRoot(
        newRoot,
        0,
        ethers.concat(sigs),
        guardians.slice(0, SIGNATURE_THRESHOLD).map(g => g.address)
      );

      expect(await anchor.nonce()).to.equal(1);
    });
  });

  describe('TID Verification', function () {
    it('Should verify valid Merkle proof', async function () {
      // Set up a simple tree
      const leaf1 = ethers.keccak256(ethers.toUtf8Bytes('leaf1'));
      const leaf2 = ethers.keccak256(ethers.toUtf8Bytes('leaf2'));
      const root = ethers.keccak256(
        ethers.concat([leaf1, leaf2].sort())
      );

      await anchor.connect(deployer).grantRole(
        await anchor.GUARDIAN_ROLE(),
        deployer.address
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

      const sig = await deployer.signMessage(ethSignedHash);

      await anchor.updateRoot(
        root,
        0,
        sig,
        [deployer.address]
      );

      // Verify leaf1
      expect(await anchor.verifyTID(leaf1, [leaf2])).to.be.true;
    });

    it('Should reject invalid Merkle proof', async function () {
      const leaf = ethers.keccak256(ethers.toUtf8Bytes('leaf'));
      const fakeProof = [ethers.keccak256(ethers.toUtf8Bytes('fake'))];

      expect(await anchor.verifyTID(leaf, fakeProof)).to.be.false;
    });
  });

  describe('Access Control', function () {
    it('Should allow admin to grant guardian role', async function () {
      const GUARDIAN_ROLE = await anchor.GUARDIAN_ROLE();

      await anchor.grantRole(GUARDIAN_ROLE, user.address);

      expect(await anchor.hasRole(GUARDIAN_ROLE, user.address)).to.be.true;
    });

    it('Should allow admin to revoke guardian role', async function () {
      const GUARDIAN_ROLE = await anchor.GUARDIAN_ROLE();
      const guardian = guardians[0];

      await anchor.revokeRole(GUARDIAN_ROLE, guardian.address);

      expect(await anchor.hasRole(GUARDIAN_ROLE, guardian.address)).to.be.false;
    });

    it('Should allow admin to update signature threshold', async function () {
      const newThreshold = 1;

      await expect(anchor.setSignatureThreshold(newThreshold))
        .to.emit(anchor, 'SignatureThresholdUpdated')
        .withArgs(SIGNATURE_THRESHOLD, newThreshold);

      expect(await anchor.signatureThreshold()).to.equal(newThreshold);
    });
  });

  describe('Pausable', function () {
    it('Should allow pauser to pause', async function () {
      await anchor.pause();
      expect(await anchor.paused()).to.be.true;
    });

    it('Should block verification when paused', async function () {
      await anchor.pause();

      const leaf = ethers.keccak256(ethers.toUtf8Bytes('leaf'));

      await expect(anchor.verifyTID(leaf, [])).to.be.revertedWithCustomError(
        anchor,
        'EnforcedPause'
      );
    });

    it('Should allow to unpause', async function () {
      await anchor.pause();
      await anchor.unpause();

      expect(await anchor.paused()).to.be.false;
    });
  });
});
