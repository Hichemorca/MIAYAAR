ALTER TABLE `marketTransactions`
  MODIFY COLUMN `propertyType` ENUM('apartment','villa','townhouse','office','retail','residential_land','land','warehouse') NOT NULL;

UPDATE `marketTransactions`
  SET `propertyType` = 'land'
  WHERE `propertyType` = 'residential_land';

ALTER TABLE `marketTransactions`
  MODIFY COLUMN `propertyType` ENUM('apartment','villa','townhouse','office','retail','land','warehouse') NOT NULL;
