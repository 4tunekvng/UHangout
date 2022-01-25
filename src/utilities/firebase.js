import { initializeApp } from "firebase/app";
import { useState, useEffect } from "react";
import { getDatabase, onValue, ref, set, push } from "firebase/database";
import {
  getAuth,
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithPopup,
  signOut,
  useAuthState,
} from "firebase/auth";
import "firebase/storage";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB7mpjxeDj2hYyFJ4JkXhctKL2lzjRb5tM",
  authDomain: "uhangout-5cbf7.firebaseapp.com",
  databaseURL: "https://uhangout-5cbf7-default-rtdb.firebaseio.com",
  projectId: "uhangout-5cbf7",
  storageBucket: "uhangout-5cbf7.appspot.com",
  messagingSenderId: "435606287641",
  appId: "1:435606287641:web:56be8346407796c3470188",
};

export const firebase = initializeApp(firebaseConfig);
export const database = getDatabase(firebase);
const storage = getStorage();

/* authentication functions */
export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });

  signInWithPopup(getAuth(firebase), provider);
};

const firebaseSignOut = () => signOut(getAuth(firebase));

export { firebaseSignOut as signOut };

export const useUserState = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    onIdTokenChanged(getAuth(firebase), setUser);
  }, []);

  return [user];
};

/* data functions */
export const useData = (path, transform) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    const dbRef = ref(database, path);
    const devMode =
      !process.env.NODE_ENV || process.env.NODE_ENV === "development";
    if (devMode) {
      console.log(`loading ${path}`);
    }
    return onValue(
      dbRef,
      (snapshot) => {
        console.log("snapshot");
        console.log(snapshot.val());
        const val = snapshot.val();
        if (devMode) {
          console.log(val);
        }
        setData(transform ? transform(val) : val);
        setLoading(false);
        setError(null);
      },
      (error) => {
        setData(null);
        setLoading(false);
        setError(error);
      }
    );
  }, [path, transform]);

  return [data, loading, error];
};

export const setData = (path, value) => set(ref(database, path), value);

export const pushData = (path, value) => {
  const listRef = ref(database, path);
  const objRef = push(listRef);
  set(objRef, value);
};

export const saveUserToDb = (userObject) => {
  setData("/users/" + userObject.uid, {
    displayName: userObject.displayName,
    email: userObject.email,
    photoURL: userObject.photoURL,
  });
};

export const handlePostPhoto = async (evt) => {
  console.log("POSTING IMAGE");
  console.log(evt);
  if (!evt.target.files || evt.target.files.length === 0) return;
  const file = evt.target.files[0];

  const storageRef = ref(storage + "/photos");

  const databaseRef = ref(database);
  // store photo on Google Storage
  // this puts everything in one folder called photos
  // you probably want to have subfolders
  const photoRef = storageRef("photos").child(file.name);
  await photoRef.put(file, {
    contentType: file.type,
  });

  const url = await photoRef.getDownloadURL();

  // store photo data on Firebase Realtime database
  const photoItemsRef = databaseRef("photos");
  // const { uid, email = "n/a" } = user;

  await photoItemsRef.push({
    url,
    // uid,
    // email,
    createdAt: database.ServerValue.TIMESTAMP,
  });
};
