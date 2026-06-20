/**
 * Firebase Storage helpers for uploading profile images.
 *
 * Uploads take a local file URI (from expo-image-picker), fetch it into a Blob
 * and push it to Storage, returning both the storage path and a download URL.
 */
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

import { storage } from "./config";

export interface UploadResult {
  storagePath: string;
  downloadURL: string;
}

async function uriToBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  return res.blob();
}

/** Upload a coach/player profile photo to profiles/{uid}/. */
export async function uploadImage(
  uid: string,
  uri: string,
  folder: "profiles" = "profiles"
): Promise<UploadResult> {
  const blob = await uriToBlob(uri);
  const storagePath = `${folder}/${uid}/${Date.now()}.jpg`;
  const storageRef = ref(storage, storagePath);
  const task = uploadBytesResumable(storageRef, blob, { contentType: "image/jpeg" });
  await task;
  const downloadURL = await getDownloadURL(storageRef);
  return { storagePath, downloadURL };
}
