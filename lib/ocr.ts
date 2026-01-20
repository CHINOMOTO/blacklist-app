import Tesseract from 'tesseract.js';

export const recognizeText = async (file: File): Promise<string> => {
    try {
        const result = await Tesseract.recognize(
            file,
            'jpn', // 日本語
            {
                logger: m => console.log(m), // 進捗ログ
            }
        );
        return result.data.text;
    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("画像の読み取りに失敗しました。");
    }
};
