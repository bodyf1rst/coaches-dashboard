import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  [key: string]: {
    fieldText: string | null;
    isSearched: boolean;
  };

  public trainingPreferences: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };
  public equipmentPreferences: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };
  public dietaryRestrictions: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };

  public departmentsList: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };

  public rewardsList: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };

  public coachesList: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };

  public employeesList: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };
  public clientsList: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };

  public organizationsList: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };
  public challengesList: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };
  public videosList: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };

  public exercisesList: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };
  public workoutsList: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };
  public plansList: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };
  public organizationSubmitionsList: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };
  public notificationsList: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };
  public allFaqs: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };
  public introVideos: { fieldText: string | null; isSearched: boolean } = {
    fieldText: null,
    isSearched: false,
  };

  constructor() { }
}

