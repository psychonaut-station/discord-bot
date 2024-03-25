import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../types';
import { get } from '../../utils/api';

type ServerStatus =
	| {
			connection_info: string;
			gamestate: number;
			map: string;
			name: string;
			players: number;
			round_duration: number;
			round_id: number;
			security_level: string;
			server_status: 1;
	  }
	| {
			err_str: string;
			name: string;
			server_status: 0;
	  };

export class CheckCommand implements Command {
	public builder = new SlashCommandBuilder()
		.setName('check')
		.setDescription('Round durumunu gösterir.');
	public async execute(interaction: ChatInputCommandInteraction) {
		try {
			const { status, response } = await get<ServerStatus[]>('server', false);

			if (status === 1) {
				const server = response[0];

				if (server.server_status === 1) {
					await interaction.reply(
						`Round #${server.round_id}: ${server.players} oyuncu ile devam etmekte.`
					);
				} else {
					await interaction.reply('Sunucu kapalı veya yeni round başlıyor.');
				}
			} else {
				await interaction.reply(
					'Sunucu bilgileri alınamadı. Daha sonra tekrar deneyin.'
				);
			}
		} catch (_) {
			await interaction.reply(
				'Sunucu bilgileri alınamadı. Daha sonra tekrar deneyin.'
			);
		}
	}
}
