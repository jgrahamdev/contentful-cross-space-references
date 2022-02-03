import { SpaceLink, Entry, ContentType, Locale, EnvironmentLink } from 'contentful'
import { FieldExtensionSDK } from '@contentful/app-sdk'

export interface SpaceConfiguration {
  [name:string]: string;
  id: string;
  spaceId: string;
  token: string;
  environment: string;
}

export interface CrossSpaceLink {
  type: 'Link',
  linkType: 'CrossSpaceLink',
  id: string,
  space: {
    sys: SpaceLink
  },
  environment: {
    sys: EnvironmentLink
  }
}

export interface CrossSpaceEntryData {
  entry: Entry<any>;
  contentType: ContentType;
  defaultLocale: Locale;
}

