
/**
 * Extracts frames from a video file at specified timestamps.
 * @param videoFile The video file.
 * @param timestamps An array of times (in seconds) to capture frames from.
 * @returns A promise that resolves to an array of base64 encoded image strings.
 */
export const extractFrames = (videoFile: File, timestamps: number[]): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const url = URL.createObjectURL(videoFile);

        if (!context) {
            return reject(new Error('Could not get canvas context.'));
        }

        video.src = url;
        video.muted = true;
        const screenshots: string[] = [];
        let currentTimestampIndex = 0;

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            video.currentTime = timestamps[currentTimestampIndex];
        };

        video.onseeked = async () => {
            if (currentTimestampIndex < timestamps.length) {
                // Wait a fraction of a second for the frame to render properly
                await new Promise(r => setTimeout(r, 200)); 
                
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                // Get base64 data URL, remove the "data:image/jpeg;base64," prefix
                const base64String = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
                screenshots.push(base64String);
                
                currentTimestampIndex++;
                if (currentTimestampIndex < timestamps.length) {
                    video.currentTime = timestamps[currentTimestampIndex];
                } else {
                    URL.revokeObjectURL(url);
                    resolve(screenshots);
                }
            }
        };

        video.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(new Error(`Video playback error: ${e}`));
        };

        video.load();
    });
};
