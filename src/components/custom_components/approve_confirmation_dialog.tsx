"use client"

import React from 'react'
import { setAccessToken, getAccessToken, clearAccessToken } from "../../lib/tokenManager";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { toast } from 'sonner';
import { apiUrl } from '@/apiConfig';
import useStore from '../../lib/store';

  
  interface AcceptProps {
    apiLink: string;
    id: string;
    field: string;
    buttonTitle: string;
    changeTo: string;
    backTo: string;
    description: string;
  }


export default function ApproveConfirmationDialog({
    apiLink,
    id,
    field,
    backTo,
    buttonTitle,
    changeTo,
    description
  }: AcceptProps) {
    
    const accessToken = getAccessToken();

    const ApiLink = apiLink;
    const RecivedId = id;
    const Field = field;
    const BackTo = backTo;
    const ButtonTitle = buttonTitle;
    const ChangeTo = changeTo;
    const Description = description;


    const {update_pending_page , increment_for_pending_page } = useStore();


    const updatedData = {
        [Field.toString()]: ChangeTo,
      };

    const handleUpdateClick = async () => {
        try {
         
          const response = await fetch(`${apiUrl}/${ApiLink}/${RecivedId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`, 
            },
            body: JSON.stringify(updatedData),
            credentials: "include",
    
            // Add any necessary headers or authentication tokens
          });
    
          if (response.ok) {
            // File successfully deleted
            console.log("File updated");
          if(Field == "OrderStatus") { increment_for_pending_page()}
            // push(`${localUrl}/${BackTo}`);
            toast("Udated Successfuly!")

          } else {
            // File deletion failed
            console.error("Failed to update file");
          }
        } catch (error) {
          console.error("Error updating file", error);
        }
      };

      
  return (
    <div>
      <AlertDialog>
  <AlertDialogTrigger><h1>{ButtonTitle}</h1></AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>{Description != ""? Description : "Are you sure to change?"}</AlertDialogTitle>
      <AlertDialogDescription>
        
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={()=>{handleUpdateClick()}}>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </div>
  )
}
