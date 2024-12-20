import {
	type ButtonInteraction,
	PermissionFlagsBits,
	type PermissionsBitField,
	type User,
} from 'discord.js';

import logger from '@/logger';
import type { PermanentButtonInteraction } from '@/types';

export const customId = 'submissionDenyButton';

export class DenySubmissionButton implements PermanentButtonInteraction {
	public customId = customId;
	public async execute(interaction: ButtonInteraction) {
		if (!interaction.inGuild() || !interaction.channel?.isThread()) return;

		const permissions = interaction.member.permissions as PermissionsBitField;

		if (!permissions.has(PermissionFlagsBits.ManageRoles)) return;

		const messageContent = interaction.message.content;

		const submitterId = messageContent.slice(
			messageContent.indexOf('<@') + 2,
			messageContent.indexOf('>')
		);

		let submitter: User | null = null;

		try {
			submitter = await interaction.client.users.fetch(submitterId);
		} catch {}

		await interaction.reply('Başvuru reddedildi.');

		try {
			await interaction.channel.setLocked(true);
			await interaction.channel.setArchived(true);
		} catch {
			await interaction.followUp('Alt başlık arşivlenemedi.');
		}

		logger.info(
			`Denied submission of [${submitter?.tag ?? 'unknown-user'}](${submitterId}) by [${interaction.user.tag}](${interaction.user.id})`
		);

		logger.channel(
			'submission',
			interaction.client,
			`<@${submitterId}> hesabının başvurusu ${interaction.user} tarafından reddedildi: ${interaction.channel}`
		);
	}
}
