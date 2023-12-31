import { Box, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import DBHelper from '../DBHelper';
import UserContext from '../UserContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatController from './ChatController';

const Chat = ({ selectedChatID, setSelectedChat }) => {
  const [chatMessages, setChatMessages] = useState(null);
  const [chatUsers, setChatUsers] = useState(null);
  const user = useContext(UserContext);

  useEffect(() => {
    ChatController.setupChat(selectedChatID, setChatMessages, setChatUsers);
    DBHelper.addWSEventListener('chat', wsListener);
  }, [selectedChatID]);

  const wsListener = (data) => {
    const receivedData = JSON.parse(data);
    ChatController.receiveWSMessage(
      receivedData,
      setChatMessages,
      selectedChatID
    );
  };

  return (
    <Box
      className="open-chat"
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      {selectedChatID === null ? (
        <Typography sx={{ margin: 'auto' }}>
          Select or create a new chat.
        </Typography>
      ) : chatMessages === null || chatUsers === null ? (
        ''
      ) : (
        <Box className="chat-content">
          <MessageList
            messages={chatMessages}
            users={chatUsers}
            chatID={selectedChatID}
          />
          <MessageInput
            sendMessage={(msg) =>
              ChatController.sendMessage(
                selectedChatID,
                setSelectedChat,
                msg,
                user.user.userData
              )
            }
          />
        </Box>
      )}
    </Box>
  );
};

export default Chat;
