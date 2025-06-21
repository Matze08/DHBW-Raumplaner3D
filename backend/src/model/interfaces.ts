// MongoDB Model Interfaces
import { ObjectId } from "mongodb";

export interface Raum {
  _id?: ObjectId;
  bezeichnung: string;
}

export interface Lehrbeauftragter {
  _id?: ObjectId;
  bezeichnung: string;
  firma: string;
  mail: string;
}

export interface Vorlesung {
  _id?: ObjectId;
  bezeichnung: string;
}

export interface Kurs {
  _id?: ObjectId;
  bezeichnung: string;
  fakultaet: string;
}

export interface Buchung {
  _id?: ObjectId;
  raum: ObjectId | Raum;
  lehrbeauftragter: ObjectId | Lehrbeauftragter;
  vorlesung: ObjectId | Vorlesung;
  kurs: ObjectId | Kurs;
  zeitStart: Date;
  zeitEnde: Date;
}

export interface BuchungFilter {
  date?: string;
  roomId?: string | null;
  courseId?: string | null;
  lecturerId?: string | null;
  lectureId?: string | null;
}

export interface Admin {
  _id?: ObjectId;
  nutzername: string;
  passwort: string;
}
