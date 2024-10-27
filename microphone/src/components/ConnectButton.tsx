import {Button} from "./ui/button.tsx";
import {
    DialogBackdrop,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTrigger
} from "./ui/dialog.tsx";
import {FC, useEffect, useState} from "react";
import {SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText} from "./ui/select.tsx";
import {createListCollection, ListCollection} from "@chakra-ui/react";

export const ConnectButton:FC<{connectFn: (id:string)=>void}> = ({connectFn}) => {
    const [deviceList, setDeviceList] = useState<ListCollection<{label:string,value:string}>>();
    const [selectedDevice, setSelectedDevice] = useState<string>('default');

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({audio: true}).then(()=>{
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                const audioDevices = devices.filter((device) => device.kind === 'audioinput');
                const coll = createListCollection({
                    items: audioDevices.map((device) => ({
                        label: device.label,
                        value: device.deviceId,
                    }))
                })
                setDeviceList(coll);
            });
        })

    },[])
    return (
        <>
            <DialogRoot>
                <DialogTrigger>
                    <Button as={"div"} size={"2xl"}>Connect</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>Select Microphone</DialogHeader>
                    <DialogBody>
                    <SelectRoot size={"md"} collection={deviceList!} value={[selectedDevice]} onValueChange={(e)=>{
                        setSelectedDevice(e.value[0]);
                    }}>
                        <SelectTrigger>
                            <SelectValueText placeholder={"Select microphone"} />
                        </SelectTrigger>
                        <SelectContent portalled={false}>
                            {deviceList?.items.map((item) => (
                                <SelectItem item={item} key={item.value}>{item.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </SelectRoot>
                    </DialogBody>
                    <DialogFooter>
                        <Button onClick={()=>connectFn(selectedDevice)} disabled={!selectedDevice}  >Connect</Button>
                    </DialogFooter>
                </DialogContent>
                <DialogBackdrop/>
            </DialogRoot>
        </>
    );
};
