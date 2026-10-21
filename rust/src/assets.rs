use glam::{Mat3, Mat4, Vec3};
use serde::Deserialize;
#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct World {
    pub id: String,
    pub name: String,
    pub gravity: f64,
    pub gravity_basis: String,
    pub gravity_note: String,
    pub shape: String,
    pub sky: String,
    pub description: String,
}
pub struct MeshData {
    pub name: String,
    pub flags: u32,
    pub vertices: Vec<f32>,
    pub indices: Vec<u32>,
}
pub fn meshes() -> Result<Vec<MeshData>, String> {
    parse(include_bytes!("../generated/scene.bin"))
}
pub fn worlds() -> Vec<World> {
    serde_json::from_str(include_str!("../generated/worlds.json"))
        .expect("validated built-in world catalog")
}
struct Reader<'a> {
    bytes: &'a [u8],
    p: usize,
}
impl Reader<'_> {
    fn take(&mut self, n: usize) -> Result<&[u8], String> {
        let end = self.p.checked_add(n).ok_or("overflow")?;
        let s = self.bytes.get(self.p..end).ok_or("truncated scene")?;
        self.p = end;
        Ok(s)
    }
    fn n(&mut self) -> Result<u32, String> {
        Ok(u32::from_le_bytes(self.take(4)?.try_into().unwrap()))
    }
    fn f(&mut self) -> Result<f32, String> {
        let v = f32::from_bits(self.n()?);
        if !v.is_finite() {
            return Err("nonfinite asset".into());
        }
        Ok(v)
    }
    fn count(&mut self, max: usize) -> Result<usize, String> {
        let n = self.n()? as usize;
        if n > max {
            return Err("asset limit".into());
        }
        Ok(n)
    }
}
pub fn parse(bytes: &[u8]) -> Result<Vec<MeshData>, String> {
    let mut r = Reader { bytes, p: 0 };
    if r.take(4)? != b"ORB2" {
        return Err("invalid scene version".into());
    }
    let count = r.count(1000)?;
    let mut geometry = Vec::new();
    for _ in 0..count {
        let count = r.count(1_000_000)?;
        if count % 6 != 0 {
            return Err("invalid vertices".into());
        }
        let mut v = Vec::with_capacity(count);
        for _ in 0..count {
            v.push(r.f()?);
        }
        let count = r.count(2_000_000)?;
        let mut idx = Vec::with_capacity(count);
        for _ in 0..count {
            let i = r.n()?;
            if i as usize >= v.len() / 6 {
                return Err("index out of bounds".into());
            }
            idx.push(i);
        }
        geometry.push((v, idx));
    }
    let count = r.count(5000)?;
    let mut batches: Vec<MeshData> = Vec::new();
    for _ in 0..count {
        let len = r.count(128)?;
        let name = std::str::from_utf8(r.take(len)?)
            .map_err(|e| e.to_string())?
            .to_owned();
        let flags = r.n()?;
        let id = r.n()? as usize;
        let (vertices, indices) = geometry.get(id).ok_or("invalid geometry id")?;
        let mut matrix = [0.; 16];
        for n in &mut matrix {
            *n = r.f()?;
        }
        let transform = Mat4::from_cols_array(&matrix);
        let normal = Mat3::from_mat4(transform).inverse().transpose();
        let mut color = [0.; 4];
        for n in &mut color {
            *n = r.f()?;
        }
        let unlit = r.f()?;
        let index = if let Some(i) = batches
            .iter()
            .position(|b| b.name == name && b.flags == flags)
        {
            i
        } else {
            batches.push(MeshData {
                name,
                flags,
                vertices: vec![],
                indices: vec![],
            });
            batches.len() - 1
        };
        let b = &mut batches[index];
        let base = (b.vertices.len() / 11) as u32;
        for v in vertices.chunks_exact(6) {
            let p = transform.transform_point3(Vec3::from_slice(&v[..3]));
            let n = (normal * Vec3::from_slice(&v[3..])).normalize_or_zero();
            b.vertices.extend([
                p.x, p.y, p.z, n.x, n.y, n.z, unlit, color[0], color[1], color[2], color[3],
            ]);
        }
        b.indices.extend(indices.iter().map(|i| i + base));
    }
    if r.p != bytes.len() {
        return Err("trailing scene bytes".into());
    }
    Ok(batches)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn scene_validates() {
        let m = meshes().unwrap();
        for w in worlds() {
            assert!(m.iter().any(|m| m.name == format!("world:{}", w.id)));
        }
        assert!(m.iter().any(|m| m.name == "bike:glass"));
        assert!(parse(&[255, 255, 255, 255]).is_err());
    }
}
