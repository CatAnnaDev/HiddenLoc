module.exports = function MigrateSettings(from_ver, to_ver, settings) {
    if (from_ver === null || from_ver === undefined) {
        return { enabled: true, block: false, mapId: 1, guardId: 24, unk: 0 }
    }
    return settings
}
