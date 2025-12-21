import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    appTitle: 'Shopping Lists',
    shoppingLists: 'Shopping Lists',
    allLists: 'All Lists',
    totalItems: 'Total Items',
    items: 'items',
    item: 'item',
    done: 'Done',
    pending: 'Pending',
    noListsYet: 'No lists yet',
    createFirstList: 'Create your first shopping list to get started',
    statistics: 'Statistics',
    itemsDone: 'Items Done',
    itemsPending: 'Items Pending',
    noItemsYet: 'No items yet',
    addItems: 'Add some items to your shopping list',
    addItemPlaceholder: 'Add item…',
    backToLists: 'Back to Lists',
    listDetails: 'List Details',
    completed: 'Completed',
    remaining: 'Remaining',
    progress: 'Progress',

    // home / list cards
    newList: 'New list',
    ownerLabel: 'Owner',
    myListsLabel: 'Mine',
    archiveLabel: 'Archive',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
    english: 'English',
    czech: 'Czech',

    // common actions / labels used across pages
    all: 'All',
    mine: 'Mine',
    shared: 'Shared',
    open: 'Open',
    delete: 'Delete',
    rename: 'Rename',
    archive: 'Archive',
    archived: 'Archived',
    members: 'Members',
    invite: 'Invite',
    emailOrName: 'Email / name',
    user: 'User',
    role: 'Role',
    action: 'Action',
    remove: 'Remove',
    leave: 'Leave',
    total: 'Total',
    showArchived: 'Show archived',
    showDone: 'Show completed',
    add: 'Add',
    edit: 'Edit',
    cancel: 'Cancel',
    confirm: 'Confirm',

    // states / messages
    loadingListDetail: 'Loading list detail…',
    loadingList: 'Loading current list state…',
    listNotFound: 'List was not found or could not be loaded.',
    failedLoadDetail: 'Failed to load list detail.',
    failedUpdateAfterItems: 'Failed to refresh list after item changes.',
    failedAddItem: 'Failed to add item.',
    failedUpdateItem: 'Failed to update item.',
    failedEditItem: 'Failed to edit item.',
    failedDeleteItem: 'Failed to delete item.',

    // confirms
    confirmDeleteItem: 'Delete this item from the list?',
    confirmDeleteList: 'Delete this shopping list?',
    confirmRemoveMember: 'Remove a member from the list?',
    confirmLeaveList: 'Do you really want to leave the list?'
  },
  cs: {
    appTitle: 'Nákupní seznamy',
    shoppingLists: 'Nákupní seznamy',
    allLists: 'Všechny seznamy',
    totalItems: 'Celkem položek',
    items: 'položek',
    item: 'položka',
    done: 'Hotovo',
    pending: 'Čeká',
    noListsYet: 'Zatím žádné seznamy',
    createFirstList: 'Vytvořte svůj první nákupní seznam',
    statistics: 'Statistiky',
    itemsDone: 'Hotových položek',
    itemsPending: 'Čekajících položek',
    noItemsYet: 'Zatím žádné položky',
    addItems: 'Přidejte položky do svého nákupního seznamu',
    addItemPlaceholder: 'Přidat položku…',
    backToLists: 'Zpět na seznamy',
    listDetails: 'Detail seznamu',
    completed: 'Dokončeno',
    remaining: 'Zbývá',
    progress: 'Průběh',

    // home / list cards
    newList: 'Nový seznam',
    ownerLabel: 'Vlastník',
    myListsLabel: 'Moje',
    archiveLabel: 'Archiv',
    lightMode: 'Světlý režim',
    darkMode: 'Tmavý režim',
    language: 'Jazyk',
    english: 'Angličtina',
    czech: 'Čeština',

    // common actions / labels used across pages
    all: 'Vše',
    mine: 'Jen moje',
    shared: 'Sdílené',
    open: 'Otevřít',
    delete: 'Smazat',
    rename: 'Přejmenovat',
    archive: 'Archivovat',
    archived: 'Archivováno',
    members: 'Členové',
    invite: 'Pozvat',
    emailOrName: 'E-mail / jméno',
    user: 'Uživatel',
    role: 'Role',
    action: 'Akce',
    remove: 'Odebrat',
    leave: 'Odejít',
    total: 'Celkem',
    showArchived: 'Zobrazit archivované',
    showDone: 'Zobrazit i vyřešené',
    add: 'Přidat',
    edit: 'Upravit',
    cancel: 'Zrušit',
    confirm: 'Potvrdit',

    // states / messages
    loadingListDetail: 'Načítám detail seznamu…',
    loadingList: 'Načítám aktuální stav seznamu…',
    listNotFound: 'Seznam nebyl nalezen nebo se ho nepodařilo načíst.',
    failedLoadDetail: 'Nepodařilo se načíst detail seznamu.',
    failedUpdateAfterItems: 'Nepodařilo se aktualizovat seznam po změně položek.',
    failedAddItem: 'Nepodařilo se přidat položku.',
    failedUpdateItem: 'Nepodařilo se aktualizovat položku.',
    failedEditItem: 'Nepodařilo se upravit položku.',
    failedDeleteItem: 'Nepodařilo se smazat položku.',

    // confirms
    confirmDeleteItem: 'Smazat položku ze seznamu?',
    confirmDeleteList: 'Opravdu smazat tento nákupní seznam?',
    confirmRemoveMember: 'Odebrat člena ze seznamu?',
    confirmLeaveList: 'Opravdu chcete odejít ze seznamu?'
  },
};

const LanguageContext = createContext(undefined);

const LANGUAGE_STORAGE_KEY = 'shopping-list-language';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'en' || stored === 'cs') {
        return stored;
      }
    }
    return 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
