import { existsSync, readFileSync } from 'node:fs';

import { TOML } from 'bun';

import type { Config } from '@/types';

if (!existsSync('config.toml')) {
	throw new Error('Config: config.toml does not exist on cwd');
}

const config = TOML.parse(readFileSync('config.toml', 'utf8')) as Config;

export const botToken = config.bot_token;
export const applicationId = config.application_id;
export const guildId = config.guild_id;
export const log = {
	path: config.log?.path,
	colorize: config.log?.colorize,
	verifyChannel: config.log?.verify_channel,
};
export const api = config.api;

const default_ = {
	botToken,
	applicationId,
	guildId,
	log,
	api,
};

export default default_;

// Validate config

if (typeof botToken !== 'string' || botToken.length === 0) {
	throw new Error('Config: bot_token is required');
}

if (typeof applicationId !== 'string' || applicationId.length === 0) {
	throw new Error('Config: application_id is required');
}

if (typeof guildId !== 'string' || guildId.length === 0) {
	throw new Error('Config: guild_id is required');
}

if (typeof log.path !== 'string' || log.path.length === 0) {
	throw new Error('Config: log.path is required');
}

if (typeof log.colorize !== 'boolean') {
	throw new Error('Config: log.colorize is required');
}

if (typeof log.verifyChannel !== 'string' || log.verifyChannel.length === 0) {
	throw new Error('Config: log.verify_channel is required');
}

if (typeof api.url !== 'string' || api.url.length === 0) {
	throw new Error('Config: api.url is required');
}

if (typeof api.token !== 'string' || api.token.length === 0) {
	throw new Error('Config: api.token is required');
}
