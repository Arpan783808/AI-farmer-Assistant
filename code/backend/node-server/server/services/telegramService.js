export const sendTelegram = async (phoneNumber, message) => {
  console.log(`Sending Telegram to ${phoneNumber}: ${message}`);
  return true;
};