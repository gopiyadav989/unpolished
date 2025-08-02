
export const generateExcerpt = (content: string) => {
    try {
        const parsedContent = JSON.parse(content);
        let textContent = "";

        for (const block of parsedContent) {
            if (typeof block.content === "string") {
                textContent += block.content + " ";
            } else if (Array.isArray(block.content)) {
                for (const item of block.content) {
                    if (item.text) textContent += item.text + " ";
                }
            }
            if (textContent.length > 150) break;
        }

        return textContent.trim().substring(0, 150) + (textContent.length > 150 ? "..." : "");
    } catch (err) {
        console.error("Excerpt generation error:", err);
        return "";
    }
};

export const calculateReadingTime = (content: string): number => {
    try {
        const parsedContent = JSON.parse(content);
        let textContent = "";

        // Extract all text from BlockNote JSON structure
        for (const block of parsedContent) {
            if (typeof block.content === "string") {
                textContent += block.content + " ";
            } else if (Array.isArray(block.content)) {
                for (const item of block.content) {
                    if (item.text) textContent += item.text + " ";
                }
            }
        }

        // assuming user's reading speed is 200wps
        const wordsPerMinute = 200;
        const wordCount = textContent.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / wordsPerMinute);
        
        return Math.max(1, readingTime); // Minimum 1 minute
    } catch (err) {
        console.error("Reading time calculation error:", err);
        return Math.max(1, Math.ceil(content.length / 1000));
    }
};