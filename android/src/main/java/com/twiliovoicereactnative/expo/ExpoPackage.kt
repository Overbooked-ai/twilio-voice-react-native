package com.twiliovoicereactnative.expo

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoPackage : expo.modules.kotlin.modules.ModulePackage() {
    override fun createModule(): Module = ExpoModule()
} 