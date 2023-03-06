// Discord JS
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

// Third party
const ytdl = require('ytdl-core');
// Utils
// const { updateGuild } = require('deploy-commands.js');

const { createAudioPlayer, joinVoiceChannel, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

// Useful for troubleshooting
/* const { generateDependencyReport } = require('@discordjs/voice');
console.log(generateDependencyReport()); */

let currentPlayback = '';
const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stream')
		.setDescription('Attempts to stream from source URL')
        // Stops existing playback
        .addStringOption(option =>
			option.setName('stop')
				.setDescription('Stops current playback')
				.addChoices(
					{ name: 'Yes', value: 'yes' },
				))
        // url to attempt to play
        .addStringOption(option =>
			option
            .setName('url')
            .setDescription('The url to stream')),

    async connectoToChannel(channel) {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
        });
        try {
            // This part seems to fail since it does not continue to the next part
            // await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
            return connection;
        }
        catch (error) {
            connection.destroy();
            throw error;
        }
    },
    async execute(interaction) {
        console.log('Starting Stream interaction');
        await interaction.deferReply({ ephemeral: true });
        const stop = interaction.options.getString('stop');
        if (stop == 'yes') {
            if (currentPlayback) {
                player.stop();
                return await interaction.followUp('Stopping current playback');
            }
            else {
                player.stop();
                return await interaction.followUp('Go away Nerevar');
            }
        }

        console.log('Playing Stream');

        const channel = interaction.channel;
        const member = interaction.member;
        const memberChannel = member.voice.channel;
        if (!memberChannel || !memberChannel.joinable) {
            return interaction.editReply('You must be connected to a voice channel in order to use this command', { ephemeral: true });
        }

        const connection = await this.connectoToChannel(memberChannel);
        player.on('error', error => {
            console.error('Error:', error.message + ' Note: Age restricted videos will not work.');
        });

        const url = interaction.options.getString('url') ?? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        const options = {
            filter: 'audioonly',
        };

        let videoUrl = '';
        let videoDescription = '';
        let videoThumbnail = '';
        let videoUploader = '';
        let videoUploaderUrl = '';
        let videoUploaderIcon = '';
        let viewCount = '';
        const inputStream = ytdl(url, options)
        .on('info', (info) => {
            currentPlayback = info.videoDetails.title;
            videoUrl = info.videoDetails.video_url;
            videoDescription = info.videoDetails.description;
            videoThumbnail = info.videoDetails.thumbnails[1];
            videoUploader = info.videoDetails.ownerChannelName;
            videoUploaderUrl = info.videoDetails.ownerProfileUrl;
            videoUploaderIcon = info.videoDetails.author.thumbnails[0].url;
            viewCount = Number(info.videoDetails.viewCount);
            console.log(currentPlayback);
        });

        const resource = createAudioResource(inputStream);
        // resource.volume.setVolume(0.5);
        console.log(resource);
        player.play(resource);
        connection.subscribe(player);

        // After we've finished buffering the input
        // stream. We should listen for the Idle status
        // because that means it is finished.
        inputStream.on('end', function() {
            console.log('Finished loading audio');
            player.on(AudioPlayerStatus.Idle, () => {
                console.log('Finished');
                interaction.followUp('Finished: ' + currentPlayback, { ephemeral: true });
                player.stop();
            });
        });

        player.on(AudioPlayerStatus.Playing, () => {
            console.log('Playing');
            interaction.editReply('Playing: ' + currentPlayback, { ephemeral: true });
            if (videoDescription && videoDescription.length > 150) {
                videoDescription = videoDescription.substring(0, 150) + '...';
            }
            let videoEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(currentPlayback)
            .setDescription(videoDescription)
            .setURL(videoUrl)
             .setAuthor({ name: videoUploader, iconURL: videoUploaderIcon, url: videoUploaderUrl })
             .addFields(
                { name: 'Views', value: viewCount.toLocaleString('en-US') },
            )
            .setImage(videoThumbnail.url)
            .setTimestamp();

            channel.send({ embeds: [videoEmbed] });
            videoEmbed = null;
            videoUrl = '';
            videoDescription = '';
            videoThumbnail = '';
            videoUploader = '';
            videoUploaderUrl = '';
            videoUploaderIcon = '';
            viewCount = '';
            currentPlayback = '';
        });
    },
};