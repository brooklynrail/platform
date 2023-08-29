
export async function up(knex) {
	await knex.schema.dropTable('settings');
}

export async function down(knex) {
	await knex.schema.dropTable('settings');
}
