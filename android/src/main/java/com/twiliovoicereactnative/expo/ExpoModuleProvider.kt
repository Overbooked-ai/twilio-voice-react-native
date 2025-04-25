package com.twiliovoicereactnative.expo

import expo.modules.kotlin.ModuleRegistry
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.providers.ExpoModuleRegistryProvider

class ExpoModuleProvider : ExpoModuleRegistryProvider {
    override fun createExpoModules(context: ModuleRegistry): List<Module> {
        return listOf(ExpoModule(context))
    }
}
