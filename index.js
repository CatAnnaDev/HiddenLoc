module.exports = function HiddenLoc(mod) {
    let lastPos = null
    let lastRealSection = null

    const describe = () => {
        if (!mod.settings.enabled) return "HiddenLoc off: your real section is reported to guild and friends."
        if (mod.settings.block) return "HiddenLoc on: section updates are blocked."
        return `HiddenLoc on: reporting section ${mod.settings.mapId} ${mod.settings.guardId} ${mod.settings.unk}.`
    }

    const sendSection = (mapId, guardId, unk) => {
        mod.send("C_VISIT_NEW_SECTION", 1, { mapId, guardId, unk })
    }

    const applyHidden = () => {
        if (!mod.settings.enabled || mod.settings.block) return
        sendSection(mod.settings.mapId, mod.settings.guardId, mod.settings.unk)
    }

    const pushLocation = (x, y, z, facing) => {
        if (facing === null && lastPos === null) {
            mod.command.message("Move once so HiddenLoc knows your facing, or pass it: loc send <x> <y> <z> [w].")
            return
        }
        const w = (facing === null) ? lastPos.w : facing
        mod.send("C_PLAYER_LOCATION", 5, {
            loc: { x, y, z },
            w,
            lookDirection: lastPos ? lastPos.lookDirection : w,
            dest: { x, y, z },
            type: 7,
            jumpDistance: 0,
            inShuttle: false,
            time: Date.now()
        })
        mod.command.message(`Sent location ${x} ${y} ${z}.`)
    }

    mod.game.on("enter_game", applyHidden)
    mod.game.on("leave_loading_screen", applyHidden)

    mod.hook("C_PLAYER_LOCATION", 5, (event) => {
        lastPos = event
    })

    mod.hook("C_VISIT_NEW_SECTION", 1, (event) => {
        lastRealSection = { mapId: event.mapId, guardId: event.guardId, unk: event.unk }
        if (!mod.settings.enabled) return
        if (mod.settings.block) return false
        event.mapId = mod.settings.mapId
        event.guardId = mod.settings.guardId
        event.unk = mod.settings.unk
        return true
    })

    mod.command.add("loc", (sub, a, b, c, d) => {
        switch ((sub || "").toLowerCase()) {
            case "hide":
            case "set": {
                const mapId = (a === undefined) ? mod.settings.mapId : parseInt(a, 10)
                const guardId = (b === undefined) ? mod.settings.guardId : parseInt(b, 10)
                const unk = (c === undefined) ? mod.settings.unk : parseInt(c, 10)
                if ([mapId, guardId, unk].some(Number.isNaN)) {
                    mod.command.message("Usage: loc hide [mapId guardId unk]")
                    return
                }
                mod.settings.mapId = mapId
                mod.settings.guardId = guardId
                mod.settings.unk = unk
                mod.settings.block = false
                mod.settings.enabled = true
                applyHidden()
                break
            }
            case "block":
                mod.settings.block = true
                mod.settings.enabled = true
                break
            case "off":
                mod.settings.enabled = false
                if (lastRealSection) sendSection(lastRealSection.mapId, lastRealSection.guardId, lastRealSection.unk)
                break
            case "on":
                mod.settings.enabled = true
                applyHidden()
                break
            case "send": {
                const x = parseFloat(a), y = parseFloat(b), z = parseFloat(c)
                if ([x, y, z].some(Number.isNaN)) {
                    mod.command.message("Usage: loc send <x> <y> <z> [w]")
                    return
                }
                const facing = (d === undefined) ? null : parseFloat(d)
                pushLocation(x, y, z, Number.isNaN(facing) ? null : facing)
                return
            }
            case "here":
                if (lastPos === null) { mod.command.message("Move once first."); return }
                pushLocation(lastPos.loc.x, lastPos.loc.y, lastPos.loc.z, lastPos.w)
                return
            case "":
            case "toggle":
                mod.settings.enabled = !mod.settings.enabled
                if (mod.settings.enabled) applyHidden()
                else if (lastRealSection) sendSection(lastRealSection.mapId, lastRealSection.guardId, lastRealSection.unk)
                break
            case "status":
                break
            default:
                mod.command.message("loc [hide [m g u]|off|on|block|send <x> <y> <z> [w]|here|status]")
                return
        }
        mod.command.message(describe())
    })
}
