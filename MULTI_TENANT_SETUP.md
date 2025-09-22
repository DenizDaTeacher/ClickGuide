# Multi-Tenant Setup Anleitung

## Überblick

Ihr Clickguide unterstützt jetzt Multi-Tenancy - verschiedene Teams können separate Domains haben und ihre eigenen Listen verwalten, während alle Daten sicher in der Cloud gespeichert werden.

## Wie es funktioniert

### 1. **Automatische Tenant-Erkennung**
Das System erkennt automatisch das Team basierend auf:
- **Domain**: `kundenservice.clickguide.com` → Team Kundenservice
- **URL-Parameter**: `?tenant=team-vertrieb` → Team Vertrieb  
- **Subdomain**: `team-support.lovableproject.com` → Team Support

### 2. **Datentrennung**
- Jedes Team sieht nur seine eigenen Listen und Schritte
- Alle Daten werden sicher in der Cloud gespeichert
- Vollständige Isolation zwischen Teams

## Domain-Setup

### Vorkonfigurierte Teams

Das System ist bereits mit folgenden Teams konfiguriert:

| Team | Domain | Beispiel-URL |
|------|--------|-------------|
| Standard | `default.localhost` | Für Entwicklung/Tests |
| Kundenservice | `kundenservice.clickguide.com` | Team-spezifische Domain |
| Vertrieb | `vertrieb.clickguide.com` | Team-spezifische Domain |  
| Support | `support.clickguide.com` | Team-spezifische Domain |

### Custom Domains einrichten

1. **In Lovable:**
   - Gehen Sie zu Projekt-Einstellungen → Domains
   - Fügen Sie Ihre gewünschte Domain hinzu (z.B. `kundenservice.ihredomaine.com`)
   - Folgen Sie den DNS-Anweisungen

2. **DNS-Konfiguration:**
   ```
   A Record: kundenservice.ihredomaine.com → 185.158.133.1
   A Record: vertrieb.ihredomaine.com → 185.158.133.1
   A Record: support.ihredomaine.com → 185.158.133.1
   ```

3. **Tenant-Konfiguration:**
   Neue Teams können über die Supabase-Datenbank hinzugefügt werden:
   ```sql
   INSERT INTO public.tenants (id, name, domain) VALUES 
   ('team-neues-team', 'Neues Team', 'neuesteam.ihredomaine.com');
   ```

## URL-Parameter (Sofortige Nutzung)

Für sofortige Tests ohne Domain-Setup:

```
https://ihr-projekt.lovableproject.com/?tenant=team-kundenservice
https://ihr-projekt.lovableproject.com/?tenant=team-vertrieb  
https://ihr-projekt.lovableproject.com/?tenant=team-support
```

## Nutzung für Teams

### Team A (Kundenservice)
- **URL**: `kundenservice.clickguide.com`
- **Funktionen**: Eigene Gesprächslisten, Button-Templates, komplett getrennte Daten

### Team B (Vertrieb)  
- **URL**: `vertrieb.clickguide.com`
- **Funktionen**: Eigene Verkaufs-Workflows, unabhängig von anderen Teams

### Team C (Support)
- **URL**: `support.clickguide.com`  
- **Funktionen**: Support-spezifische Abläufe und Vorlagen

## Vorteile

✅ **Separate Domains** - Jedes Team hat seine eigene URL  
✅ **Cloudbasierte Speicherung** - Keine lokalen Daten  
✅ **Vollständige Datentrennung** - Teams sehen nur ihre Daten  
✅ **Kostengünstig** - Ein Supabase-Projekt für alle Teams  
✅ **Einfache Verwaltung** - Zentrale Administration möglich  
✅ **Skalierbar** - Beliebig viele Teams hinzufügbar  

## Technische Details

### Datenbank-Struktur
- Alle Tabellen haben eine `tenant_id` Spalte
- Automatische Filterung nach Team
- Row Level Security (RLS) für Datensicherheit

### Sicherheit
- Jedes Team kann nur auf seine eigenen Daten zugreifen
- Keine Möglichkeit der Datenvermischung zwischen Teams
- Verschlüsselte Datenübertragung

## Support & Wartung

- **Neue Teams hinzufügen**: Einfach über Supabase-Dashboard
- **Domains ändern**: Über Lovable Domain-Verwaltung  
- **Daten-Migration**: Teams können bei Bedarf zwischen Domains wechseln
- **Backup**: Alle Daten werden automatisch in Supabase gesichert

## Beispiel-Workflows

1. **Team-Onboarding:**
   - Neuen Tenant in Datenbank anlegen
   - Domain konfigurieren  
   - Team-Mitarbeiter einweisen

2. **Tägliche Nutzung:**
   - Team A öffnet `kundenservice.clickguide.com`
   - Arbeitet mit eigenen Listen
   - Team B arbeitet parallel auf `vertrieb.clickguide.com`
   - Keine Überschneidungen oder Konflikte

3. **Administration:**
   - Zentrale Übersicht über alle Teams möglich
   - Team-spezifische Berechtigungen
   - Flexible Konfiguration je nach Bedarf