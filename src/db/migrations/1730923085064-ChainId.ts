import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChainId1730923085064 implements MigrationInterface {
  name = 'ChainId1730923085064';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tokens ALTER COLUMN chain_id TYPE varchar USING chain_id::varchar, ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE transactions ALTER COLUMN chain_id TYPE varchar USING chain_id::varchar, ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE orders ALTER COLUMN chain_id TYPE varchar USING chain_id::varchar, ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE nfts ALTER COLUMN chain_id TYPE varchar USING chain_id::varchar, ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE vestings ALTER COLUMN chain_id TYPE varchar USING chain_id::varchar, ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE vesting_contracts ALTER COLUMN chain_id TYPE varchar USING chain_id::varchar, ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE start_block_sablier ALTER COLUMN chain_id TYPE varchar USING chain_id::varchar, ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE start_blocks ALTER COLUMN chain_id TYPE varchar USING chain_id::varchar, ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE contract_sablier ALTER COLUMN chain_id TYPE varchar USING chain_id::varchar, ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(`DROP TYPE "public"."ChainNumberEnum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."ChainNumberEnum" AS ENUM('1', '56', '97', '11155111')`,
    );

    await queryRunner.query(
      `ALTER TABLE tokens ALTER COLUMN chain_id TYPE "public"."ChainNumberEnum" USING chain_id::"public"."ChainNumberEnum", ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE transactions ALTER COLUMN chain_id TYPE "public"."ChainNumberEnum" USING chain_id::"public"."ChainNumberEnum", ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE orders ALTER COLUMN chain_id TYPE "public"."ChainNumberEnum" USING chain_id::"public"."ChainNumberEnum", ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE nfts ALTER COLUMN chain_id TYPE "public"."ChainNumberEnum" USING chain_id::"public"."ChainNumberEnum", ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE vestings ALTER COLUMN chain_id TYPE "public"."ChainNumberEnum" USING chain_id::"public"."ChainNumberEnum", ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE vesting_contracts ALTER COLUMN chain_id TYPE "public"."ChainNumberEnum" USING chain_id::"public"."ChainNumberEnum", ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE start_block_sablier ALTER COLUMN chain_id TYPE "public"."ChainNumberEnum" USING chain_id::"public"."ChainNumberEnum", ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE start_blocks ALTER COLUMN chain_id TYPE "public"."ChainNumberEnum" USING chain_id::"public"."ChainNumberEnum", ALTER COLUMN chain_id SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE contract_sablier ALTER COLUMN chain_id TYPE "public"."ChainNumberEnum" USING chain_id::"public"."ChainNumberEnum", ALTER COLUMN chain_id SET NOT NULL`,
    );
  }
}
