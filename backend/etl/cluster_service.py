"""Cluster service: builds the joined cluster list (replaces P3's import-time
`cluster_manager.py` driver) and handles deletes.

The 4 source JSON files stay unchanged. Deleted cluster ids are saved to
`data/deleted_ids.json` so deletions are still gone after a restart.
"""
import json
import os

from .cluster import Cluster
from .vm_data_manager import VMDataManager, DATA_DIR

DELETED_IDS_FILE = os.path.join(DATA_DIR, 'deleted_ids.json')

data_manager = VMDataManager()


def load_deleted_ids():
    if not os.path.exists(DELETED_IDS_FILE):
        return []
    with open(DELETED_IDS_FILE, 'r') as f:
        return json.load(f)


def save_deleted_ids(deleted_ids):
    with open(DELETED_IDS_FILE, 'w') as f:
        json.dump(deleted_ids, f, indent=2)


def get_all_clusters():
    """Build every cluster from the ETL, skipping deleted ones."""
    deleted_ids = load_deleted_ids()
    clusters = []
    for cluster_id in data_manager.get_all_vm_ids():
        if cluster_id in deleted_ids:
            continue
        cluster = Cluster(cluster_id, data_manager)
        cluster.set_cluster_info()
        clusters.append(cluster.to_dict())
    return clusters


def get_cluster(cluster_id):
    for cluster in get_all_clusters():
        if cluster['id'] == cluster_id:
            return cluster
    return None


def delete_cluster(cluster_id):
    """Mark a cluster as deleted. Returns True if it existed."""
    if get_cluster(cluster_id) is None:
        return False
    deleted_ids = load_deleted_ids()
    if cluster_id not in deleted_ids:
        deleted_ids.append(cluster_id)
        save_deleted_ids(deleted_ids)
    return True
