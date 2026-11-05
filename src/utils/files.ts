import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type ShareFileOptions = {
  mimeType: string;
  /** iOS Uniform Type Identifier for the file. */
  uti: string;
  dialogTitle: string;
};

/** Writes text to a temporary file and opens the share sheet so it can be saved or sent. Returns false if sharing isn't available. */
export const shareTextFile = async (
  fileName: string,
  content: string,
  { mimeType, uti, dialogTitle }: ShareFileOptions,
): Promise<boolean> => {
  if (!(await Sharing.isAvailableAsync())) {
    return false;
  }

  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(content);
  await Sharing.shareAsync(file.uri, { mimeType, UTI: uti, dialogTitle });
  return true;
};

/** Lets the person pick a file and returns its text, or null if they cancel. */
export const pickTextFile = async (): Promise<string | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    // Some file managers label JSON as plain text or a generic file.
    type: ['application/json', 'text/plain', 'application/octet-stream'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || result.assets.length === 0) {
    return null;
  }
  return new File(result.assets[0].uri).text();
};
