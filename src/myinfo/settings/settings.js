import './settings.2017-do-not-delete.jsondb';

function settings (jsondb) {
  const _private_ = {};

  class Settings {
    constructor (jsondb) {
      if (jsondb && jsondb.dataPlugins) {
        // ToDo: Before storing the jsondb we should validate the schema (e.g. https://github.com/hapijs/joi)
        // ToDo: Or maybe outside of the class before calling new decide if the schema is valid or not!?
        _private_.data = jsondb;
        _private_.dataTmp = { dataPlugins: {}, layoutPlugins: {} };
      } else {
        _private_.data = { msg: 'You have to initialize it first!' };
      }
    }

    getJsondb () {
      return JSON.stringify(_private_.data);
    }

    getDataPlugins () {
      return _private_.data.dataPlugins;
    }

    registerDataPlugin (dataPluginKey) {
      if (this.getDataPluginRegistered(dataPluginKey) === false) {
        _private_.dataTmp.dataPlugins[dataPluginKey].registered = true;
      } else {
        // log.ERROR(`Settings.registerDataPlugin(${dataPluginKey}).already_registered`);
      }
    }

    getDataPluginRegistered (dataPluginKey) {
      if (!_private_.dataTmp.dataPlugins[dataPluginKey]) {
        _private_.dataTmp.dataPlugins[dataPluginKey] = { registered: false };
      }
      return _private_.dataTmp.dataPlugins[dataPluginKey].registered;
    }

    getLayoutPlugins () {
      return _private_.data.layoutPlugins;
    }

    registerLayoutPlugin (layoutPluginKey, layoutPluginClass) {
      if (this.getLayoutPluginClass(layoutPluginKey) === null) {
        _private_.dataTmp.layoutPlugins[layoutPluginKey].class = layoutPluginClass;
      } else {
        // log.ERROR(`Settings.registerLayoutPlugin(${layoutPluginKey}).class.already_registered`);
      }
    }

    getLayoutPluginClass (layoutPluginKey) {
      if (!_private_.dataTmp.layoutPlugins[layoutPluginKey]) {
        _private_.dataTmp.layoutPlugins[layoutPluginKey] = { class: null };
      }
      return _private_.dataTmp.layoutPlugins[layoutPluginKey].class;
    }
  }

  return new Settings(jsondb);
}

export { settings };
