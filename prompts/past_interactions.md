# HISTORIQUE DES INTERACTIONS 

> Ce fichier liste les points clés des échanges par ordre chronologique, du plus ancien (#1) au plus récent (#n)

## [#1] Discussion sur l'utilité du projet
**Contexte** : Question sur les cas d'usage potentiels du projet chat-to-notion.

**Points clés** :
- Archivage de conversations importantes
- Documentation de travail depuis différents canaux de chat
- Prise de notes automatisée depuis des conversations
- Sauvegarde de conversations avec des IA
- Organisation de contenu collaboratif
- Automatisation de workflows documentaires

## [#2] Clarification sur le support multi-formats
**Contexte** : Discussion sur l'extension du projet pour supporter différents formats d'input.

**Points clés** :
- Support prévu pour JSON, XML, CSV, PDF et texte brut
- Le backend doit détecter automatiquement le format
- Le backend doit parser chaque format selon sa structure
- Transformation du contenu parsé en structure Notion appropriée
- Frontend doit accepter texte brut ET fichiers (glisser-déposer)

**Questions soulevées** :
- Pour le texte brut : détection automatique des patterns de chat ou configuration manuelle ?
- Pour CSV/JSON/XML : mapping automatique ou configurable ?
- Pour PDF : extraction de texte uniquement ou aussi structure ?

## [#3] Amélioration de la documentation
**Contexte** : Demande d'amélioration du README.

**Points clés** :
- Ajout de la section Prérequis (Python 3.8+, Node.js 16+)
- Ajout d'informations sur les variables d'environnement
- Ajout d'exemples de formats de chat
- Documentation détaillée des endpoints API avec exemples
- Ajout d'une section Troubleshooting
- Amélioration de la structure du projet (ajout du dossier prompts/)
- Ajout d'une section Future Enhancements

## [#4] Ajout de la licence et documentation API
**Contexte** : Demande d'ajouter la mention explicite de la licence MIT et le lien vers la documentation API Notion.

**Points clés** :
- Section License mise à jour avec mention explicite "MIT License"
- Ajout du lien vers la documentation API Notion dans la section Usage
- Création d'une section Resources avec liens utiles vers Notion