import {useEffect, useState} from "react";
import {io, Socket} from "socket.io-client";
import {displayResults, socketEvents, TDisplayResult} from "./enums.ts";
import {Box, Text} from "@chakra-ui/react";

function App() {
  const [connection, setConnection] = useState<Socket>()
  const [text, setText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const connect = () => {
    const socket = io('',{path: '/api/socket.io'});
    socket.on('connect', () => {
      console.log('connected');
      setConnection(socket);
    });
    socket.on(socketEvents.DISPLAYRESULT, (data: TDisplayResult)=>{
      switch (data.action) {
        case displayResults.LIVETEXT:
          setText(data.payload);
          break;
        case displayResults.TRANSLATEDTEXT:
          setTranslatedText(data.payload);
          break;
      }
    })
    setConnection(socket);
  }

  useEffect(() => {
    connect()
    return () => {
        connection?.disconnect()
    }
  }, []);

  return (
    <Box w={"full"} h={"100vh"} p={"10"} flexDirection={"column"} gap={5} boxSizing={"border-box"} display={"flex"} alignItems={"end"} justifyContent={"end"} >
      {translatedText && <Box pos={"relative"} p={"2"} bg={"rgba(0,0,0,0.4)"} color={"white"} textAlign={"end"}>
        <img alt={"gemini"} style={
          {
            position:"absolute",
            top:"-18px",
            left:"-18px",
            width:"30px"
          }
        } src={"/display/img.png"} />
        <Text>{translatedText}</Text>
      </Box>}

      {text && <Box p={"2"} bg={"rgba(0,0,0,0.5)"} color={"white"} textAlign={"end"}>
        <Text>{text}</Text>
      </Box>}
    </Box>
  )
}

export default App
