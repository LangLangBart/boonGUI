declare namespace Engine
{
	/**
	 * Flags the start of a profiling with the indentifier "name"
	 */
	function ProfileStart(name: string): void;

	/**
	 * Ends the more recent ProfileStart flag started
	 */
	function ProfileStop(): void;

	/**
	 * Flag to call in between ProfileEnd and ProfileEnd calls.
	 * Can be called zero or more times.
	 */
	function ProfileAttribute(name: string): void;

	/**
	 * Return an array of pathname strings, one for each matching entry
	 * in the specified directory.
	 * @param path - Path base directory. Empty string means root dir.
	 * @param filterStr - Default: "" - String match; see vfs_next_dirent for syntax
	 * @param recurse - Default: false - Make search recursive
	 */
	function ListDirectoryFiles(path: string, filterStr?: string, recurse?: boolean): string[];

	/**
	 * @returns true if the file exits
	 */
	function FileExists(filePath: string): boolean;

	/**
	 * @returns JSON as an javascirpt object.
	 */
	function ReadJSONFile(filePath: string): object | null;
}

/**
 * Prints to stdout if in debug mode
 */
declare function print(...text: string[]): void;

/**
 * Prints to internal console and to mainlog.html
 */
declare function log(text: string): void;

/**
 * Prints to internal console, mainlog.html and interestinglog.html
 * Prefixed with "WARNING:"
 */
declare function warn(text: string): void;

/**
 * Prints to internal console, mainlog.html and interestinglog.html
 * Prefixed with "ERROR:"" and color red
 */
declare function error(text: string): void;

/**
 * Deep copy (recursive copy)
 */
declare function clone(data: any): any | undefined;

/**
 * Deep freeez object (recusive freezed)
 * @returns deep freezed object
 */
declare function deepfreeze(object: object): object | undefined;
