/**
 * Handle what happens when the entity dies.
 */
Health.prototype.HandleDeath = function()
{
	const cmpSoundManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_SoundManager);
	const cmpDeathDamage = Engine.QueryInterface(this.entity, IID_DeathDamage);
	const cmpIdentity = Engine.QueryInterface(this.entity, IID_Identity);

	if (cmpDeathDamage)
		cmpDeathDamage.CauseDeathDamage();

	if (MatchesClassList(cmpIdentity.GetClassesList(), "Hero"))
		cmpSoundManager.PlaySoundGroup("actor/hero/death/coqui-ai_TTS_Hero_Death.xml", this.entity);
	PlaySound("death", this.entity);

	if (this.template.SpawnEntityOnDeath)
		this.CreateDeathSpawnedEntity();

	switch (this.template.DeathType)
	{
	case "corpse":
		this.CreateCorpse();
		break;

	case "remain":
		return;

	case "vanish":
		break;

	default:
		error(`Invalid template.DeathType: ${this.template.DeathType}`);
		break;
	}

	Engine.DestroyEntity(this.entity);
};

Engine.ReRegisterComponentType(IID_Health, "Health", Health);
