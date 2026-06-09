# 01 - Základní UI a architektonický koncept

## Slash commands
- Pro chat imput a vůbec pro provedené příkazy jak AI tak programatické budou sloužit "slash commands". Principem je jedna definice možných příkazů, odkud si budou ostatní části brát data. Slouží jako zdroj pravdy.

Příklad:
```ts
const sleshCommands = {
    "/help": {
        name: t("sleshCommands.help.name"),
        description: t("sleshCommands.help.description"),
        command: () => showHelp(parameter),
    }
} as const;
```

- Mělo by být v core-utils asi.
- Pro první implementaci se bude implementovat pouze `/help` command: Vrátí markdown pro chatovací okno. Má parametr `showModal: boolean`. Jestli true, makdown s nápovědou se ukáže v modalu. Obsahem help bude seznam sleshCommands s description.

## Obsidian plugin
- Postraní panel slouží pro všechny vychytávky pluginu. Boční panel se bude skládat ze dvou částí: přepínače obsahu (asi buttonGroup -> podle toho, jak se to řeší v obsidianu) a obsahu konkrétního pohledu.

### Menu Area
- V horní části. Buď tlačítka nebo buttonGroup podle toho jak tot řeší Obsidian.
- Jednotlivé pohledy jsou definované ve vlastním definičním souboru:

```ts
const mainMenu = [
    {
        name: t("mainMenu.chat.name"),
        icon: Icon("icon"),
        description: t("mainMenu.chat.description"),
        content: <Chat />,
    }
] as const;
```

- Tlačítka se budou vytvářet na loopu z definice
- Tlačítko bude obsahovat pouze ikonu a tooltip.
- Pokud je aktivní okno, tlačítko bude zvýrazněno, že je aktivní stav. Při kliknutí na jiné tlačítko se stav změní na neaktivní.

- Úplně vpravo panelu bude tlačítko s vertikální tří tečkovou ikonou. Po kliknutí se otevře menu. Toto menu se bude vytvářet také na základě definice podobně jako mainMenu:

- MainMenu v této iteraci bude mít dvě položky: "Chat" a "Rychlé Akce"

```ts
const menu = [
    {
        name: t("menu.item.name"),
        icon: Icon("icon"), // nepoviný parametr
        command: fnc, // nepoviný parametr
    },
    {
        name: "divider", // vykreslí divider
    }
] as const;

```

### Obsah
- Načítá se pomoci definice mainMenu
- Pozor, ve spodní části Obsidianu jsou informace o počtu slov. Obsah musí mít margin bottom, aby informační panel nepřekážel obsahu.

## Chatovací panel
- V této iteraci se nebude implementovat AI chat. Pouze UI s mockovanými daty a jeden funkční slashCommand "help".

- nahoře bude prostor pro případná tlačítka s menu. Zatím jen mock.

### prostor pro odpovědi
1) Pole pro input uživatele. Zvýrazněný panel, který bude zobrazovat několik řádků uživatelova vstupu. Zbytek bude zabalený. Ale bude tam malé tlačítko pro rozbalit a pro kopírovat.

2) komponenta pro loading odpovědí AI. Animované zvýrazňující se tři tečky nebo něco podobného

3) Akordeon, kde se budou vypisovat logy z procesu AI. Jakmile se vypíšou, tak akordeon automaticky zavře.

4) Odpověď AI. Odpověď AI bude uvozena jménem "Aurelius". Pokud se bude jednat o programatický výstup, tak se žádné jméno neukáže. Komponenta bude parsovat markdown. Odpověď nebude v panelu. Jen padding, aby text nešel úplně do konce

- prostor pro odpověď se musí scrollovat, pokud je delší.

### Uživatelský input
- Celý input bude v jednom panelu. Textarea nebude mít extra zvýraznění.
- Text area se musí posouvat nahoru, pokud je text delší. Dát mu rozumný limit.
- Pod inputem bude tlačítko "+". Po kliknutí se objeví options s vyhledávacím polem. Pod ním se budou ukazovat soubory, které jsou v projektu. Funkcionalita se bude implementovat.
- Na pravé straně pak bude odesílací tlačítko.
- Klávesová zkratka pro odeslání imputu bude "alt + enter"
- Text area bude mít placeholder "Něco napiš..."

## Quick Action
- QuckActions bude postavena na definici:

```ts
const quickActions = [
    {
        name: t("name"),
        open: true
        items: [
            {
                name: t("name"),
                description: t("description"),
                icon: Icon("icon"),
                sleshCommand: "/help" // nepoviné pole. Zpracovává slashCommands
                command: customCommand, // nepoviné pole. Custom funkce, která se spustí.
            }
        ]
    }
 ] as const;
```

- Položky v poli quick action budou v accordionu. Accordion ukazuje v hlavičce "name". Property "open" indikuje jestli je accordion defaltutně otevřený nebo zavřený.
- items: Items reprezentují tlačítka. Tlačítka ukazují vlevo ikonu a vedle název. Po kliknutí se provede sleshCommand. Pokud není definován, tak command.
- tlačítka budou pod sebou


---

# 01 — Basic UI and Architectural Concept

## Goal

Create the first usable UI foundation for the Obsidian Literary Assistant plugin.

This iteration does **not** implement real AI communication. It implements:

* sidebar layout,
* main navigation,
* chat panel UI,
* mock chat messages,
* one working slash command: `/help`,
* quick actions panel,
* file attachment UI and basic file selection from the vault/project.

---

## Architectural Constraints

* Slash command definitions belong inside `packages/obsidian-plugin`, not inside `packages/core-utils`.
* `core-utils` may contain only reusable logic that does not depend on Obsidian, React UI, plugin state, i18n runtime, or modals.
* UI definitions should avoid storing JSX elements directly inside configuration objects when a safer identifier or render factory can be used.
* All user-facing text must use i18n keys.
* Use Obsidian-native styling variables and UI conventions where possible.
* This iteration should prefer the smallest safe implementation.

---

## Slash Commands

Slash commands will be used for chat input actions and programmatic commands.

There should be one central plugin-level registry that acts as the source of truth for available slash commands.

Initial command:

```ts
/help
```

### `/help` behavior

The `/help` command should:

* generate markdown help content,
* list available slash commands,
* include each command name and description,
* support option `showModal: boolean`.

Behavior:

* if `showModal === true`, render help markdown inside an Obsidian modal,
* if `showModal === false`, return markdown so it can be displayed in the chat response area.

The command registry should be typed and prepared for future commands.

Suggested shape:

```ts
const slashCommands = {
  "/help": {
    id: "help",
    nameKey: "slashCommands.help.name",
    descriptionKey: "slashCommands.help.description",
    execute: executeHelpCommand,
  },
} as const;
```

Avoid hardcoded translated strings inside the command definition. Use translation keys.

---

## Obsidian Plugin Sidebar

The plugin sidebar is the main container for plugin features.

It consists of:

1. top menu area,
2. active view content area.

---

## Main Menu Area

The top menu area contains:

* main view buttons,
* right-side overflow menu button.

### Main Views

Initial main views:

1. Chat
2. Quick Actions

Main views should be defined in a single plugin-level definition file.

Suggested shape:

```ts
const mainMenuItems = [
  {
    id: "chat",
    nameKey: "mainMenu.chat.name",
    descriptionKey: "mainMenu.chat.description",
    icon: "message-square",
    view: "chat",
  },
  {
    id: "quickActions",
    nameKey: "mainMenu.quickActions.name",
    descriptionKey: "mainMenu.quickActions.description",
    icon: "zap",
    view: "quickActions",
  },
] as const;
```

Requirements:

* buttons are rendered by looping over the definition,
* each button shows only an icon,
* tooltip shows translated description/name,
* active button is visually highlighted,
* clicking a different button changes the active view.

### Overflow Menu

The right side of the menu area contains a vertical three-dot button.

For the menu use obsidian api for menu. For items of menu use definition file.

For this iteration, menu items may be minimal or mocked, but the definition structure should exist.

---

## Content Area

The content area renders the active view selected from `mainMenuItems`.

Requirements:

* content must be scroll-safe,
* bottom spacing must account for Obsidian's bottom status/info area,
* layout must work in a narrow sidebar.

---

## Chat Panel

This iteration implements chat UI only, not real AI communication.

The chat panel contains:

1. optional top toolbar area,
2. scrollable message area,
3. user input area.

---

## Chat Message Area

The message area displays mock data and programmatic outputs.

Message types:

1. User message
2. AI loading indicator
3. Process log accordion
4. AI response
5. Programmatic markdown response

### User Message

User message should appear in a highlighted panel.

Requirements:

* show several lines of user input,
* collapse overflowed long text,
* include small expand/collapse control,
* include copy button.

### AI Loading Indicator

Show animated loading indicator, such as three pulsing dots.

### Process Log Accordion

The process log accordion displays AI/process logs.

Requirements:

* logs appear during mocked processing,
* once the process completes, accordion automatically collapses.

### AI Response

AI response:

* is introduced by the name `Aurelius`,
* renders markdown,
* is not placed inside a heavy panel,
* uses readable padding.

### Programmatic Response

Programmatic output:

* renders markdown,
* does not show the `Aurelius` name.

The `/help` command output is a programmatic markdown response.

---

## User Input Area

The user input area is a single visual panel containing:

1. attached file tags,
2. textarea,
3. bottom action row.

### Attached File Tags

When files are attached, tags appear above the textarea.

Each tag shows:

* file name,
* remove `x` button.

Clicking remove detaches the file from the current message draft.

### Textarea

Requirements:

* no extra visual border beyond the input panel,
* placeholder: `Něco napiš...`,
* grows upward or scrolls internally when content is long,
* has a reasonable max height,
* supports keyboard shortcut `Alt + Enter` for submit.

### Bottom Action Row

Left side:

* `+` button for attaching project/vault files.

Right side:

* send button.

### File Attachment Picker

Clicking `+` opens an options panel/popover.

The panel contains:

* search input,
* list of files available in the current project/vault,
* click-to-attach behavior.

For this iteration, implement basic file listing and attachment state.

Attached files are not sent to AI yet. They are only displayed as selected context for the future message.

---

## Quick Actions View

Quick Actions are defined in a plugin-level definition file.

Suggested shape:

```ts
const quickActions = [
  {
    id: "general",
    nameKey: "quickActions.general.name",
    openByDefault: true,
    items: [
      {
        id: "help",
        nameKey: "quickActions.help.name",
        descriptionKey: "quickActions.help.description",
        icon: "help-circle",
        slashCommand: "/help",
      },
    ],
  },
] as const;
```

Requirements:

* groups render as accordions,
* accordion header shows translated group name,
* `openByDefault` controls initial open state,
* items render as vertical buttons,
* button shows icon and name,
* clicking an item executes `slashCommand` if defined,
* if no `slashCommand` exists, execute custom `command`,
* if neither exists, item should be disabled or ignored safely.

Initial Quick Action:

* Help → executes `/help`.

---

## Testing Requirements

Tests should focus on logic, not visual rendering.

Required tests:

* slash command registry contains `/help`,
* `/help` generates markdown containing available commands,
* quick action execution resolves `slashCommand` before custom command,
* attached file state supports add/remove,
* menu definitions contain required initial views.

Tests should be placed in root-level `__tests__` directories of the relevant main module.

Do not create nested `__tests__` folders.

---

## Out of Scope

Do not implement in this iteration:

* real AI provider integration,
* streaming AI responses,
* persistent chat history,
* advanced file content extraction,
* prompt orchestration,
* settings screen,
* real workflow execution beyond `/help`.

---

# Úpravy první iterace

## Vizuální UI a UX opravy

### Tlačítka pro menu a volby:
- Současný stav: Tlačítka mají grafiku jako tlačítko. Oprava: Má být vidět pouze ikona bez rámečku a pozadí. Pouze při hoover a aktivním okně se ukáže pozadí. Myslím, že se pro to používá class "clickable-icon". Ověř si toto v dokumentaci Obsidian.

### Tooltipy
- Zjistil jsem, že tlačítka a další prvky mají už tootil s aria-label. Extra tooltipy se můžou odstranit. Nechat ty, který jsou z obsidianu. Přidat pro aria-label i18n, pokud není.
- Tooltipy se teď zobrazují i view prvků. Toto není chtěné. Tooltipy jen u tlačítek.

### Chat panel - uživatelský prompt
- expand a copy použijeme ikony (standartní, které se používají pro copy expand). A použít tlačítko bez rámečku a pozadí. Rámeček a pozadí jen hoover.

### Uživatelský Input
- Při delším textu se nezvětšuje input. Očekávané chování je, že pokud text začne přetékat, tak high text area zvětší tak, aby se tam vešlo 10 řádků. Toto nastavení dej constanty na začátek souboru, aby se dalo jednoduše měnit.
- Nefunguje klávesová zkratka pro odeslání "alt + Enter"
- Tlačítko "+" pro přidání souboru pouze ikona. Stejně tak i nabídka souborů. Rámeček pouze na hoover.

## i18n
- České překlady neobsahují diakritiku. Je třeba psát české texty z diakritikou.

## Slash command /help in quick action
- Má otevřít modál a tam zobrazit nápovědu. Ne v chatovacím okně. "showModal" má být nastavený na true.

## Code reveiw

- c:/Users/marti/Documents/git/obsidian-ai-literary-assistant/packages/obsidian-plugin/src/commands/slashCommands.ts tato metoda je zbytečně složitá:

The current slash command registry is over-engineered and violates DRY. Refactor it into a single slashCommands object that contains both metadata and the execute function on the same key, using as const satisfies Record<string, SlashCommandDefinition>. Let executeHelpCommand access the registry dynamically via internal import or context to prevent circular dependencies.

Příklad implementace:
```ts
import { executeHelpCommand } from "./helpCommand";
import type { SlashCommandContext, SlashCommandDefinition, SlashCommandResult } from "./slashCommandTypes";

// 1. Jediný zdroj pravdy - vše na jednom místě
export const slashCommands = {
  "/help": {
    id: "help",
    name: "/help",
    nameKey: "slashCommands.help.name",
    descriptionKey: "slashCommands.help.description",
    execute: (context: SlashCommandContext) => executeHelpCommand(context),
  },
  "/review": {
    id: "review",
    name: "/review",
    nameKey: "slashCommands.review.name",
    descriptionKey: "slashCommands.review.description",
    execute: (context: SlashCommandContext) => Promise.resolve({ success: true }), // Příklad pro další iteraci
  }
} as const satisfies Record<string, SlashCommandDefinition>;

// 2. TypeScript si typy odvodí sám z objektu výše
export type RegisteredSlashCommandName = keyof typeof slashCommands;
```

- Zkontroluj, jestli se podobný problém nevyskytuje i u jiných definic. Cíl je jednoduché intuitivní přidávání nových položek do definic.