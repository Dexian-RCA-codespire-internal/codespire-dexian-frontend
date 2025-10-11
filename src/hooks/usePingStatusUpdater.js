import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPingStatus } from '../store/pingStatusSlice';
import {integrationService} from "../api"


export default function usePingStatusUpdater()  {
  const dispatch = useDispatch();
  const intervalRef = useRef();
  
  useEffect(() => {
   const getPingStatus = async () => {
      const response = await integrationService.getPingStatus();
      if(response?.success){
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        const status = {
          time,
          ServiceNow: response?.data?.serviceNow,
          Jira: response?.data?.jira,
          Remedy: response?.data?.remedy,
          Zendesk: response?.data?.zendesk,
        };
        dispatch(addPingStatus(status));
      }
    }
    getPingStatus();
    intervalRef.current = setInterval(getPingStatus, 2 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
    // Only depend on dispatch, not pingHistory, to avoid double calls
    // eslint-disable-next-line
  }, [dispatch]);
}
