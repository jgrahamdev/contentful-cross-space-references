import { SpaceLink, Entry, ContentType, Locale } from 'contentful'
import { FieldExtensionSDK } from '@contentful/app-sdk'

export interface SpaceConfiguration {
  [name:string]: string;
  id: string;
  token: string;
}

export interface CrossSpaceLink {
  type: 'Link',
  linkType: 'CrossSpaceLink',
  id: string,
  space: {
    sys: SpaceLink
  }
}

export interface CrossSpaceEntryData {
  entry: Entry<any>;
  contentType: ContentType;
  defaultLocale: Locale;
}

