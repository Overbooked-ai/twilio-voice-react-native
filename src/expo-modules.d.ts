/**
 * Type definitions for expo-modules-core to fix build issues
 */

declare module 'expo-modules-core' {
  export function requireNativeModule(name: string): any;
  export function requireNativeViewManager(name: string): any;
  
  // Add other required functions and types here
  export class NativeModule<T> {}
  export function registerWebModule<T>(moduleImplementation: T): T;
} 