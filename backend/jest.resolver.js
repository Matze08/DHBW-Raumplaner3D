export default function(request, options) {
  // Handle .js imports for TypeScript files
  if (request.endsWith('.js')) {
    const tsPath = request.replace(/\.js$/, '.ts');
    try {
      return options.defaultResolver(tsPath, options);
    } catch (error) {
      // Fall back to original request
      return options.defaultResolver(request, options);
    }
  }
  
  return options.defaultResolver(request, options);
}
