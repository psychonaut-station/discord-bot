import {
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js';

import type { Command } from '@/types';
import { get } from '@/utils';

interface User {
	id: string;
	username: string;
	discriminator: string;
	global_name: string;
	avatar: string;
}

export class WhoCommand implements Command {
	public builder = new SlashCommandBuilder()
		.setName('who')
		.setDescription('Oyuncunun Discord hesabını gösterir.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('ckey')
				.setDescription('Oyuncunun ckeyi ile Discord hesabını gösterir.')
				.addStringOption((option) =>
					option
						.setName('ckey')
						.setDescription('Oyuncunun ckeyi')
						.setRequired(true)
						.setAutocomplete(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('user')
				.setDescription('Oyuncunun Discord hesabı ile ckeyini gösterir.')
				.addUserOption((option) =>
					option
						.setName('user')
						.setDescription('Oyuncunun Discord hesabı')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('character')
				.setDescription('Oyuncunun karakterinin adı ile ckeyini gösterir.')
				.addStringOption((option) =>
					option
						.setName('character')
						.setDescription('Oyuncunun karakterinin adı')
						.setRequired(true)
						.setAutocomplete(true)
				)
		);
	public async execute(interaction: ChatInputCommandInteraction) {
		switch (interaction.options.getSubcommand()) {
			case 'ckey': {
				const ckey = interaction.options.getString('ckey', true);

				const { statusCode, body: user } = await get<User>(
					`player/discord/?ckey=${ckey}`
				);

				if (statusCode === 200) {
					await interaction.reply(`Oyuncunun Discord hesabı: <@${user.id}>`);
				} else if (statusCode === 404) {
					await interaction.reply('Oyuncu bulunamadı.');
				} else if (statusCode === 409) {
					await interaction.reply('Oyuncunun Discord hesabı bağlı değil.');
				}

				break;
			}
			case 'user': {
				const user = interaction.options.getUser('user', true);

				const { statusCode, body: ckey } = await get<string>(
					`player/discord/?discord_id=${user.id}`
				);

				if (statusCode === 200) {
					await interaction.reply(`Oyuncunun ckeyi: \`${ckey}\``);
				} else if (statusCode === 409) {
					await interaction.reply('Oyuncunun Discord hesabı bağlı değil.');
				}

				break;
			}
			case 'character': {
				let icName = interaction.options.getString('character', true);
				let exactMatch = false;

				if (icName.endsWith('\u00ad')) {
					icName = icName.slice(0, -1);
					exactMatch = true;
				}

				const { body: names } = await get<{ name: string; ckey: string }[]>(
					`autocomplete/ic_name?ic_name=${icName}`
				);

				let filteredNames = names!;

				if (exactMatch) {
					filteredNames = names!.filter((entry) => entry.name === icName);
				}

				if (filteredNames.length === 0) {
					await interaction.reply('Oyuncu bulunamadı.');
					return;
				}

				const formatEntry = (entry: { name: string; ckey: string }) =>
					`${entry.name} - \`${entry.ckey}\``;

				await interaction.reply(filteredNames.map(formatEntry).join('\n'));

				break;
			}
		}
	}
	public async autocomplete(interaction: AutocompleteInteraction) {
		const focusedValue = interaction.options.getFocused(true);

		if (focusedValue.name === 'character') {
			const { body } = await get<{ name: string; ckey: string }[]>(
				`autocomplete/ic_name?ic_name=${focusedValue.value}`
			);

			if (body!.length === 0) {
				await interaction.respond([]);
				return;
			}

			const names = body!.map(({ name }) => name);
			const uniqueNames = [...new Set(names)];

			await interaction.respond(
				uniqueNames.map((name) => ({ name, value: `${name}\u00ad` }))
			);
		}
	}
}
