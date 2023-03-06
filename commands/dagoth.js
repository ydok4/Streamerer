const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

// Third party
const ytdl = require('ytdl-core');

// Utils
// const { updateGuild } = require('deploy-commands.js');

const { createAudioPlayer, joinVoiceChannel, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');

const dagothUrls = [
    // Dagoth Ur meets argonian Nerevar (Animated)
    'https://www.youtube.com/watch?v=kNipoNLC6Eg',
    // Dagoth Has Standards
    // 'https://www.youtube.com/watch?v=yUdWCeRP3oY',
    // Dagoth Ur goes to Fargoth’s for Steamed Hams (AI Voice Meme)
    // 'https://www.youtube.com/watch?v=6yNfdXI_Qbc',
    // Dagoth Ur hates gaming laptops
    'https://www.youtube.com/watch?v=k3hsFEoiTwI',
    // Dagoth Ur goes for Tea
    'https://www.youtube.com/watch?v=-15AjGmE_6g',
    // Dagoth Ur likes McChicken
    'https://www.youtube.com/watch?v=7xmjdWct4qE',
    // Dagoth Ur Apologizes for a severe and continuous lapse in his Judgement
    // 'https://www.youtube.com/watch?v=7EcwlMXEYYk',
    // POV: You're a Speedrunner in Morrowind | Dagoth Ur AI Voice Skit
    'https://www.youtube.com/watch?v=RTA87EH7LqQ',
    // Dagoth Ur Pops Off
    'https://www.youtube.com/watch?v=mFDEqXM7EcU',
    // Dagoth Ur Rants About The High Elves
    // 'https://www.youtube.com/watch?v=XR-ozA7lsAE',
    // Nerevarine Learns the Truth About Dagoth Ur - Better Call Sul S1E09
    'https://www.youtube.com/watch?v=jcIaRZFuILc',
    // Dagoth Ur had an incident (ai voice meme)
    'https://www.youtube.com/watch?v=WbmqD1QmzrE',
    // Dagoth Ur asks the Nerevarine to help him with his taxes (ai voice meme)
    'https://www.youtube.com/watch?v=k378mHXHVPk',
    // Dagoth Ur wants the Nerevarine to stop doing Skooma (ai voice meme)
    'https://www.youtube.com/watch?v=tj01SqC4-Iw',
    // Dagoth Ur has something to say to the Nerevarine (ai voice meme)
    'https://www.youtube.com/watch?v=efV8608pw2E',
    // Dagoth Ur finds out about the Lusty Argonian Maid (ai voice meme)
    'https://www.youtube.com/watch?v=wBYD8bPW4RA',
    // Dagoth Ur insults the Nerevarine's fit (ai voice meme)
    'https://www.youtube.com/watch?v=wKLk7ZozZQ8',
    // Dagoth Ur gets into a game night argument
    'https://www.youtube.com/watch?v=L4UkSnZVg3U',
    // Dagoth Ur calls the bank about strange charges on his account
    'https://www.youtube.com/watch?v=2kqF5u8LAIE',
    // Dagoth Ur's Skyrim Waifu Tier List
    'https://www.youtube.com/watch?v=Gtxpmev0WKU',
    // Dagoth Roast
    'https://www.youtube.com/watch?v=YHhXj5o3Uy0',
    // Dagoth Ur cannot sleep (ai voice meme)
    'https://www.youtube.com/watch?v=SigDbX7uO_4',
    // Dagoth Ur gets involved in the Skooma trade (ai voice meme)
    'https://www.youtube.com/watch?v=AhALQkGrPCE',
    // Dagoth Ur wants maple syrup (ai voice meme)
    'https://www.youtube.com/watch?v=RMmolRWJJQ4',
    // Dagoth Ur hates Sturart Little
    'https://www.youtube.com/watch?v=YG9xAIiPGz4',
    // Dagoth Ur dresses weird (ai voice meme)
    'https://www.youtube.com/watch?v=96m7PScWHrI',
    // Dagoth Ur gets evicted (ai voice meme)
    'https://www.youtube.com/watch?v=qdPA5Axcaiw',
    // Dagoth Ur plays League of Legends (ai voice meme)
    'https://www.youtube.com/watch?v=nF084xPybUs',
    // Dagoth Ur makes an only fans (ai voice meme)
    'Dagoth Ur makes an only fans (ai voice meme)',
    // Dagoth Ur Find's Nerevar's "Homework" Folder
    'https://www.youtube.com/watch?v=R31z01Am-gM',
    // Dagoth Ur: Nerevar is probably a furry
    'https://www.youtube.com/watch?v=2kRbJ13mVXg',
    // Dagoth Ur purchases a Silt Strider (ai voice meme)
    'https://www.youtube.com/watch?v=RXaR7wZ4iH8',
    // Dagoth Ur's Morrowind Vacation
    'https://www.youtube.com/watch?v=GHz5gWpkaac',
    // Dagoth Shave
    'https://www.youtube.com/watch?v=CuupAaZ2BEM',
    // Dagoth Ur's favorite soda was discontinued (ai voice meme)
    'https://www.youtube.com/watch?v=PFd6EoQyE6A',
    // Dagoth Ur has terrible neighbors (ai voice meme)
    'https://www.youtube.com/watch?v=MayGa_vqk9Y',
    // Dagoth Ur's sleepers are unionizing (ai voice meme)
    'https://www.youtube.com/watch?v=RJn8gg1XylI',
    // Dagoth Ur is threatened by gnomes (ai voice meme)
    'https://www.youtube.com/watch?v=sWSD2F9RNqs',
    // Dagoth Ur goes to Denny's (ai voice meme)
    'https://www.youtube.com/watch?v=j3SGqI3gnXY',
];

const randomArrayItem = function(array) {
    const randomItem = array[Math.floor(Math.random() * array.length)];
    return randomItem;
};

let currentPlayback = '';
const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dagoth')
		.setDescription('Welcome Moon and Start, to this place where destiny is made.')
        // Stops existing playback
        .addStringOption(option =>
			option.setName('stop')
				.setDescription('Goodbye Nerevar')
				.addChoices(
					{ name: 'Yes', value: 'yes' },
				)),

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
                return await interaction.followUp('Goodbye Nerevar');
            }
            else {
                player.stop();
                return await interaction.followUp('No current playback');
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

        const url = randomArrayItem(dagothUrls);
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
                interaction.followUp('Goodye Nerevar: ' + currentPlayback, { ephemeral: true });
                player.stop();
            });
        });

        player.on(AudioPlayerStatus.Playing, () => {
            console.log('Playing');
            interaction.editReply('Hello Nerevar', { ephemeral: true });
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