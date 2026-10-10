import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying TipToken...');
  const TipToken = await ethers.getContractFactory('TipToken');
  const tipToken = await TipToken.deploy();
  await tipToken.waitForDeployment();
  const tipTokenAddress = await tipToken.getAddress();
  console.log('TipToken deployed to:', tipTokenAddress);

  console.log('Deploying Staking...');
  const Staking = await ethers.getContractFactory('Staking');
  const staking = await Staking.deploy(tipTokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log('Staking deployed to:', stakingAddress);

  console.log('Deploying CampaignFactory...');
  const CampaignFactory = await ethers.getContractFactory('CampaignFactory');
  const factory = await CampaignFactory.deploy(tipTokenAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log('CampaignFactory deployed to:', factoryAddress);

  console.log('Setting staking contract on factory...');
  await factory.setStakingContract(stakingAddress);

  console.log('\n=== Deployment Complete ===');
  console.log('TipToken:', tipTokenAddress);
  console.log('Staking:', stakingAddress);
  console.log('CampaignFactory:', factoryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
