# HiddenLoc

A TERA Toolbox mod that hides or spoofs the map section your client reports to the server.

When you enter a new map section the client sends `C_VISIT_NEW_SECTION` (map id, guard id).
HiddenLoc can block that packet so the server never learns you moved, or replace it with a
fixed fake section.

## Commands

| command | effect |
| --- | --- |
| `loc` / `loc toggle` | turn hiding on or off |
| `loc on` / `loc off` | force on / off |
| `loc block` | on, and block the packet entirely |
| `loc set <mapId> <guardId> <unk>` | on, and report this fixed section instead |
| `loc status` | print the current state |

The setting is saved in `config.json` and survives a reload.

## Install

Drop the folder in your Toolbox `mods` directory and reload. Opcodes used:
`C_VISIT_NEW_SECTION` (version 1).

## Commands

Root command `loc`:

- `loc` / `loc toggle` — toggle the feature.
- `loc hide` / `loc set [mapId guardId unk]` — set the fake location (defaults to settings if omitted).
- `loc on` / `loc off` — enable / disable.
- `loc block` — toggle blocking.
- `loc send` — send the location now.
- `loc here` — use your current location.
- `loc status` — show current state.
