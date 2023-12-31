import { Box, Typography, useTheme } from '@mui/material';
import { useContext, useEffect, useRef } from 'react';
import UserContext from '../UserContext';
import Message from './Message';
import StyledAvatar from '../styled-components/StyledAvatar';
import StyleHelper from '../styles/StyleHelper';
import DBHelper from '../DBHelper';

const MessageList = ({ messages, users, chatID }) => {
  const userContext = useContext(UserContext);
  const theme = useTheme();
  const chatEnd = useRef(null);

  let previousMessageUser = null;

  useEffect(() => {
    if (chatEnd.current) {
      chatEnd.current.scrollIntoView(false);
    }
  }, [messages]);

  const handleDeleteMessage = async (id) => {
    const response = await DBHelper.makeHTTPRequest(
      `chat/${chatID}/message/${id}/delete`,
      'POST'
    );
    if (response.successful) {
      DBHelper.sendWSMessage({
        type: 'send_message',
        chatID,
        message: JSON.stringify({
          type: 'delete_message',
          msgID: id,
          chatID,
          isLastMessage: response.data.isLastMessage,
        }),
      });
    }
  };

  return messages === null || users === null ? (
    ''
  ) : (
    <Box className="chat-messages">
      {messages.map((m, index) => {
        return (
          <Box
            key={m._id || index}
            sx={{ display: 'flex', flexDirection: 'column' }}
          >
            {(() => {
              const messageSender =
                previousMessageUser === m.from ||
                userContext.user.id === m.from ? (
                  ''
                ) : (
                  <Box sx={{ display: 'flex' }}>
                    <StyledAvatar
                      alt={users.get(m.from).username}
                      src={
                        'data:image/jpg;base64,' +
                        users.get(m.from).profileImage
                      }
                      size="25px"
                      sx={{ marginRight: '10px' }}
                    />
                    <Typography fontSize="10px" sx={{ marginTop: 'auto' }}>
                      {users.get(m.from).username}
                    </Typography>
                  </Box>
                );
              previousMessageUser = m.from;
              return messageSender;
            })()}

            <Message
              message={m.text}
              id={m._id}
              deleteMessageHandler={handleDeleteMessage}
              color={StyleHelper.getBorderColor(theme, index)}
              sentByThisUser={m.from == userContext.user.id}
            />
            <div ref={chatEnd}></div>
          </Box>
        );
      })}
    </Box>
  );
};

export default MessageList;
