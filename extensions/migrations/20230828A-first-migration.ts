import type { Knex } from 'knex';

export async function up(knex) {
	await knex.schema.createTable('test', (table) => {
		table.increments();
		table.string('rijk');
	});
}

export async function down(knex) {
	await knex.schema.dropTable('test');
}
