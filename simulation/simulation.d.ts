declare namespace Engine {
	/**
	 * Register component (implementation) that can used by the entities.
	 * @param IID - Interface ID used
	 * @param name - Name of the component
	 * @param object - The component (implementation)
	 */
	function RegisterComponentType(IID: number, name: string, object: object): void;

	/**
	 * Register component (implementation) that can used by the system.
	 * @param IID - Interface ID used
	 * @param name - Name of the component
	 * @param object - The component (implementation)
	 */
	function RegisterSystemComponentType(IID: number, name: string, object: object): void;

	/**
	 * Reregister component (implementation) that can used by the entities.
	 * The component must have been registered before.
	 * @param IID - Interface ID used
	 * @param name - Name of the component
	 * @param object - The component (class implementation)
	 */
	function ReRegisterComponentType(IID: number, name: string, object: object): void;

	/**
	 * Creates a global variable IID_`name` identifying the interface.
	 * Using already existing interface name is not allowed.
	 * @param name - Name of the interface
	 */
	function RegisterInterface(name: string): void;

	/**
	 * Creates a global variable MT_`name` identifying the message type.
	 * Using already existing message type name is not allowed.
	 * @param name - Name of the interface
	 */
	function RegisterMessageType(name: string): void;

	/**
	 * Creates a global variable `name` identifying the message type.
	 * Equivalent to js code: global[`name`] = `value`;
	 * @param name - Name of the global variable
	 * @param value - Value of the global variable
	 */
	function RegisterGlobal(name: string, value: any): void;

	/**
	 * Get the component (given the interface ID) of the entity.
	 * @param entityID - Entity ID
	 * @param IID - Interface ID
	 * @returns - Component interface object if exist otherwise undefined
	 */
	function QueryInterface(entityID: number, IID: number): object | undefined;

	/**
	 * Get all entities with specified iterface ID.
	 * @param IID - Interface ID
	 */
	function GetEntitiesWithInterface(IID: number): number[];

	/**
	 * Get all components that implement the interface.
	 * @param IID - Interface ID
	 */
	function GetComponentsWithInterface(IID: number): object[];

	/**
	 * Send a message, targeted at a particular entity. The message will be received by any
	 * components of that entity which subscribed to the message type, and by any other components
	 * that subscribed globally to the message type.
	 * Any component with prototype.onMT_name will receive it.
	 * @param entityID - Entity ID receiver of the message
	 * @param MT - Message type (MT_name)
	 * @param message - Message
	 */
	function PostMessage(entityID: number, MT: number, message: object): void;

	/**
	 * Send a message, not targeted at any particular entity. The message will be received by any
	 * components that subscribed (either globally or not) to the message type.
	 * Any component with prototype.onMT_name will receive it.
	 * @param MT - Message type (MT_name)
	 * @param message - Message
	 */
	function BroadcastMessage(MT: number, message: object): void;

	/**
	 * Create entity.
	 * @param templateName - Entity template name
	 * @returns Entity ID
	 */
	function AddEntity(templateName: string): number;

	/**
	 * Create local entity.
	 * A local entity is an entity that doesn't affect the simulation
	 * and thus can't cause OOS (ex:corpse).
	 * This entity will not be synchronised over the network, stored in
	 * saved games, etc.
	 * @param templateName - Entity template name
	 * @returns Entity ID
	 */
	function AddLocalEntity(templateName: string): number;

	/**
	 * Destroy entity.
	 * @param entityID - Entity ID
	 */
	function DestroyEntity(entityID: number): void;

	/**
	 * Does the actual destruction of components from DestroyComponentsSoon.
	 * This must not be called if the component manager is on the call stack (since it
	 * will break internal iterators).
	 */
	function FlushDestroyedEntities(): void;
}
