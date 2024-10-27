import {useEffect, useRef, useState} from 'react'
import './App.css'
import {Box, Text} from "@chakra-ui/react";
import {io, Socket} from "socket.io-client";
import {toaster} from "./components/ui/toaster.tsx";
import {IMicNotification, micActions, micNotifications, socketEvents} from "./enums.ts";
import {ConnectButton} from "./components/ConnectButton.tsx";

function App() {
    const [connection, setConnection] = useState<Socket>()
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioInputRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const processorRef = useRef<AudioWorkletNode | null>(null);
    const connect = () => {
        const socket = io('',{path: '/api/socket.io'});
        socket.on('connect', () => {
            console.log('connected');
            setConnection(socket);
        });
        setConnection(socket);
        socket.on(socketEvents.MICNOTIFICATION, (data: IMicNotification<any, any>) => {
            console.log('data', data);
            switch (data.action) {
                case micNotifications.SETMICSUCCESS:
                    console.log('success', data.payload);
                    toaster.success({
                        title: 'Success',
                        description: data.payload,
                        type: 'success'
                    })
                    setIsConnected(true);
                    break;
                case micNotifications.INFO:
                    console.log('info', data.payload);
                    toaster.create({
                        title: 'Info',
                        description: data.payload,
                        type: 'info'
                    })
                    break;
                case micNotifications.ERROR:
                    console.error('error', data.payload);
                    toaster.create({
                        title: 'Error',
                        description: data.payload,
                        type: 'error'
                    })
                    disconnect();
                    break;
                case micNotifications.MICALREADYINUSE:
                    console.error('error', data.payload);
                    toaster.create({
                        title: 'Error',
                        description: data.payload,
                        type: 'error',
                        action:{
                            label: 'Replace Mic',
                            onClick: ()=>{
                                socket?.emit(socketEvents.MICACTION, {action: micActions.REPLACEMIC, payload: null});
                        }
                        }
                    })
                    break;
                case micNotifications.MICREPLACED:
                    setIsConnected(false)
            }
        })
    }

    const connectMic = async (id:string) =>{
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: id,
                sampleRate: 16000,
                sampleSize: 16,
                channelCount: 1,
            },
            video: false,
        });

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        await audioContext.audioWorklet.addModule('/src/worklets/recorderWorkletProcessor.js');
        await audioContextRef.current.resume()
        audioInputRef.current = audioContext.createMediaStreamSource(stream);

        processorRef.current = new AudioWorkletNode(audioContext, 'recorder.worklet');

        processorRef.current.connect(audioContext.destination);
        await audioContextRef.current.resume();
        audioInputRef.current.connect(processorRef.current);

        processorRef.current.port.onmessage = (event) => {
            console.log('event', event);
            connection?.emit(socketEvents.MICSENDAUDIO, event.data);
        }

    }

    const sendMicAction = (id:string) => {
        connection?.emit(socketEvents.MICACTION, {action: micActions.SETMIC, payload: null});
        connectMic(id);
    };


    const disconnect = () => {
        connection?.disconnect();
        processorRef.current?.disconnect();
        audioContextRef.current?.close();
        audioInputRef.current?.disconnect();
        setIsConnected(false);
    }


    useEffect(() => {
        connect()
        return () => {
            connection?.disconnect();
            processorRef.current?.disconnect();
            audioContextRef.current?.close();
            audioInputRef.current?.disconnect();
        }

    }, [setConnection]);

  return (
    <>
      <Box w={"full"} display={"flex"} justifyContent={"center"} alignItems={"center"} h={"100svh"}>
          {!isConnected && <ConnectButton connectFn={sendMicAction} />}
          {isConnected && <Box>
            <Text textStyle={"lg"} >Connected</Text>
              <Text textStyle={"md"}>if you wish to disconnect or change mic input, just refresh</Text>
          </Box>}
      </Box>
    </>
  )
}

export default App
